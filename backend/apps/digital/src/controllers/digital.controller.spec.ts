import { Test, TestingModule } from '@nestjs/testing';
import { DigitalController } from './digital.controller';
import { DigitalService } from './digital.service';

describe('DigitalController', () => {
  let digitalController: DigitalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DigitalController],
      providers: [DigitalService],
    }).compile();

    digitalController = app.get<DigitalController>(DigitalController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(digitalController.getHello()).toBe('Hello World!');
    });
  });
});
