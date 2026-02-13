import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Body,
  Res,
} from '@nestjs/common';
import { Request } from 'express';
import { DeeplinkService } from '../deeplink.service';

@Controller('deeplink')
export class DeeplinkController {
  constructor(private readonly deeplinkService: DeeplinkService) {}


  // GET /deeplink/d/:code
  @Get('d/:code')
  async resolveDeeplink(
    @Param('code') code: string,
    @Req() req: Request,
  ) {
    return this.deeplinkService.resolveDeeplink({
      code,
      ip: req.ip ?? '',
      userAgent: req.headers['user-agent'],
    });
  }

  // POST /deeplink/conversion
  @Post('conversion')
  async trackConversion(@Body() body: any) {
    return this.deeplinkService.trackConversion(body);
  }
}
