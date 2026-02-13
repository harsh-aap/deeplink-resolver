import { ConfigService } from '@nestjs/config';
import { REDIS_CACHE, REDIS_PUB_SUB } from './config.constants';

export default (configService: ConfigService) => ({
  cache: {
    host: configService.get<string>(REDIS_CACHE.HOST, ''),
    port: configService.get<number>(REDIS_CACHE.PORT, 6379),
    password: configService.get<string>(REDIS_CACHE.PASSWORD, ''),
    db: configService.get<number>(REDIS_CACHE.DB, 0),
  },
  pubSub: {
    host: configService.get<string>(REDIS_PUB_SUB.HOST, ''),
    port: configService.get<number>(REDIS_PUB_SUB.PORT, 6379),
    password: configService.get<string>(REDIS_PUB_SUB.PASSWORD, ''),
    db: configService.get<number>(REDIS_PUB_SUB.DB, 0),
  },
});

