import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudController } from './solicitud.controller';
import { SolicitudService } from './solicitud.service';

describe('SolicitudController', () => {
  let solicitudController: SolicitudController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudController],
      providers: [SolicitudService],
    }).compile();

    solicitudController = app.get<SolicitudController>(SolicitudController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(solicitudController.getHello()).toBe('Hello World!');
    });
  });
});
