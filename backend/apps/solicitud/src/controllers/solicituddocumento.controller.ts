/* eslint-disable prettier/prettier */
import { FileServiceInterface } from '@app/infrastructure/storage/interfaces/fileservice.interface';
import { Controller, Get, Param, Post, Body, Version, Res, Inject, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { UploadDocumentDto } from 'apps/solicitud/src/application/dtos/uploadfile.dto';
import { MtrSolicitudDocumento } from '../../../../libs/infrastructure/src/f2pglobal/entities/MtrSolicitudDocumento';
import { UploadExternalFileCommand } from '../application/CQRS/commands/uploadfile.command';
import { DownloadFileQuery } from '../application/CQRS/queries/download.query';
import { SolicitudDocumentoQuery } from '../application/CQRS/queries/solicituddocumento.query';
import { DownloadFileDto } from '../application/dtos/downloadfile.sto';
import { DonwloadFileModel } from '../domain/models/downloadfile.model';

@ApiTags('solicitud-documentos')
@Controller('SolicitudDocumento')
export class SolicitudDocumentoController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    
  ) {}

  @Version('1')
  @Get(':id_solicitud')
  async findByQuery(@Param('id_solicitud') id_solicitud: number): Promise<MtrSolicitudDocumento[]> {
    return this.queryBus.execute(new SolicitudDocumentoQuery(id_solicitud));
  }

  @Version('1')
  @Post()
  async uploadFile(@Body() uploadDto: UploadDocumentDto) {
    await this.commandBus.execute(new UploadExternalFileCommand(uploadDto))
  }

  @Version('1')
  @HttpCode(200)
  @Post('download')
  async readImage(@Res() res, @Body() dto: DownloadFileDto) {
    console.log(dto)
    const data = await this.queryBus.execute<DownloadFileQuery, DonwloadFileModel>(new DownloadFileQuery(dto))
    res.contentType(data.fileheader);
    return data.fileContent.pipe(res)
  }
}
