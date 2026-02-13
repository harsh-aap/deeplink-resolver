import { Module } from '@nestjs/common';
import { DeeplinkService } from './deeplink.service';
import { DeeplinkController } from './controller/deeplink.controller';

@Module({
  providers: [DeeplinkService],
  controllers: [DeeplinkController]
})
export class DeeplinkModule {}
