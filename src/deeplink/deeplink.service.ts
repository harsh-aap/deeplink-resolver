import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '../config/database';
import { redis } from '../config/redis.helper';
import * as geoip from 'geoip-lite';
import { QueryTypes } from 'sequelize';

@Injectable()
export class DeeplinkService {
  /* ---------------------------------------------------
   * Helper: Weighted A/B variant picker
   * --------------------------------------------------- */
  private pickWeightedVariant(variants: any[]) {
    const total = variants.reduce((sum, v) => sum + v.weight, 0);
    let rand = Math.random() * total;

    for (const v of variants) {
      if (rand < v.weight) return v;
      rand -= v.weight;
    }
    return variants[0];
  }

  /* ---------------------------------------------------
   * Resolve Deeplink
   * --------------------------------------------------- */
  async resolveDeeplink(payload: {
    code: string;
    ip: string;
    userAgent?: string | undefined;
    referrer?: string | undefined;
  }) {
    const { code, ip, userAgent = null, referrer = null } = payload;

    if (!code) {
      throw new BadRequestException('Deeplink code is required');
    }

    /* ---------------------------------------------------
     * 1️⃣ Rate limiting (IP + code)
     * --------------------------------------------------- */
    const ipKey = `dl:ip:${ip}:${code}`;
    const hits = await redis.incr(ipKey);

    if (hits === 1) {
      await redis.expire(ipKey, 60); // 1 min window
    }

    if (hits > 50) {
      throw new BadRequestException('Too many requests');
    }

    /* ---------------------------------------------------
     * 2️⃣ Cache lookup
     * --------------------------------------------------- */
    let link: any = await redis.get(`dl:${code}`);

    if (link) {
      link = JSON.parse(link);
    } else {
      const result: any = await db.query(
        `
        SELECT d.*, c.id AS campaign_id
        FROM deeplinks d
        LEFT JOIN deeplink_campaigns c
          ON c.id = d.campaign_id
        WHERE d.short_code = :code
          AND d.deleted_at IS NULL
          AND d.is_active = true
          AND (d.expiry_at IS NULL OR d.expiry_at > NOW())
        `,
        {
          replacements: { code },
          type: QueryTypes.SELECT,
          plain: true,
        },
      );

      if (!result) {
        throw new BadRequestException('Deeplink expired or invalid');
      }

      link = result;

      // Cache for 1 hour
      await redis.setex(`dl:${code}`, 3600, JSON.stringify(link));
    }

    /* ---------------------------------------------------
     * 3️⃣ A/B variant selection
     * --------------------------------------------------- */
    const variants: any[] = await db.query(
      `
      SELECT *
      FROM deeplink_ab_variants
      WHERE deeplink_id = :deeplink_id
      `,
      {
        replacements: { deeplink_id: link.id },
        type: QueryTypes.SELECT,
      },
    );

    const chosenVariant = variants.length
      ? this.pickWeightedVariant(variants)
      : null;

    const destinationUrl =
      chosenVariant?.destination_url || link.destination_url;

    /* ---------------------------------------------------
     * 4️⃣ Geo lookup
     * --------------------------------------------------- */
    const geo = geoip.lookup(ip);

    /* ---------------------------------------------------
     * 5️⃣ Async analytics (fire & forget)
     * --------------------------------------------------- */
    db
      .query(
        `
        INSERT INTO deeplink_clicks
          (
            deeplink_id,
            campaign_id,
            variant_id,
            ip,
            user_agent,
            referrer,
            country,
            city
          )
        VALUES
          (
            :deeplink_id,
            :campaign_id,
            :variant_id,
            :ip,
            :user_agent,
            :referrer,
            :country,
            :city
          )
        `,
        {
          replacements: {
            deeplink_id: link.id,
            campaign_id: link.campaign_id || null,
            variant_id: chosenVariant?.id || null,
            ip,
            user_agent: userAgent,
            referrer,
            country: geo?.country || null,
            city: geo?.city || null,
          },
        },
      )
      .catch((err: any) => {
        console.error('Deeplink analytics insert failed', err);
      });

    /* ---------------------------------------------------
     * 6️⃣ Redirect destination
     * --------------------------------------------------- */
    return destinationUrl;
  }

  /* ---------------------------------------------------
   * Track Conversion
   * --------------------------------------------------- */
  async trackConversion(payload: {
    user_id: string;
    deeplink_id: string;
    campaign_id?: string;
    event_type: string;
    amount?: number | null;
  }) {
    const {
      user_id,
      deeplink_id,
      campaign_id = null,
      event_type,
      amount = null,
    } = payload;

    if (!user_id || !deeplink_id || !event_type) {
      throw new BadRequestException('Missing required conversion fields');
    }

    await db.query(
      `
      INSERT INTO deeplink_conversions
        (
          user_id,
          deeplink_id,
          campaign_id,
          event_type,
          amount
        )
      VALUES
        (
          :user_id,
          :deeplink_id,
          :campaign_id,
          :event_type,
          :amount
        )
      `,
      {
        replacements: {
          user_id,
          deeplink_id,
          campaign_id,
          event_type,
          amount,
        },
      },
    );

    return { success: true };
  }
}
