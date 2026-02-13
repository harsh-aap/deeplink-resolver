import { Test, TestingModule } from '@nestjs/testing';
import { DeeplinkService } from './deeplink.service';

describe('DeeplinkService', () => {
  let service: DeeplinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeeplinkService],
    }).compile();

    service = module.get<DeeplinkService>(DeeplinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
