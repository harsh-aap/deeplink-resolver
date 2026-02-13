import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisOptions: any = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redis = new Redis(redisOptions);

// Cache helper functions
export const getCache = async (key:any) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async (key:any, value:any, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const deleteCache = async (key:any) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};
