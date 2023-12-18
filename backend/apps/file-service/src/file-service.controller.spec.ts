import { Test, TestingModule } from '@nestjs/testing';
import { FileServiceController } from './controllers/file-service.controller';
import { FileServiceService } from '../../../libs/infrastructure/src/storage/file-service.service';

describe('FileServiceController', () => {
  let fileServiceController: FileServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FileServiceController],
      providers: [FileServiceService],
    }).compile();

    fileServiceController = app.get<FileServiceController>(FileServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fileServiceController.getHello()).toBe('Hello World!');
    });
  });
});
