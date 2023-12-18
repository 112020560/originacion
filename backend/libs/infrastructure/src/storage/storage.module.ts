/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FileServiceService } from './file-service.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: 'FileServiceInterface',
      useClass: FileServiceService
    }
  ],
  exports: [{
    provide: 'FileServiceInterface',
    useClass: FileServiceService
  }],
})
export class StotageModule {}
