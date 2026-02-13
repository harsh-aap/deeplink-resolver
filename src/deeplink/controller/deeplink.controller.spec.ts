import { Test, TestingModule } from '@nestjs/testing';
import { DeeplinkController } from './controller/deeplink.controller';

describe('DeeplinkController', () => {
  let controller: DeeplinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeeplinkController],
    }).compile();

    controller = module.get<DeeplinkController>(DeeplinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
