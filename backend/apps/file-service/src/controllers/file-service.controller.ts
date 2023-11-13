/* eslint-disable prettier/prettier */
import { FileServiceService } from '@app/infrastructure/storage/file-service.service';
import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { UploadDocumentDto} from '../../../solicitud/src/application/dtos/uploadfile.dto';

@Controller()
export class FileServiceController {
  constructor(private readonly fileServiceService: FileServiceService) {}

  // @Get()
  // getHello(): string {
  //   return this.fileServiceService.getHello();
  // }

  @Post('upload')
  @UseInterceptors(FileInterceptor('filebody'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const currentDate = new Date();
    const filePath = join(currentDate.getFullYear().toString(),(currentDate.getMonth() + 1).toString(),'documentos',file.filename);
    await this.fileServiceService.uploadFile(filePath, file.buffer);
  }

  @Post()
  async uploadFileBase64(@Body() uploadDto: UploadDocumentDto) {
    // const currentDate = new Date();
    // const filePath = join(currentDate.getFullYear().toString(),(currentDate.getMonth() + 1).toString(),'documentos',);
    // await this.fileServiceService.uploadFile(filePath, file.buffer);
  }
}
