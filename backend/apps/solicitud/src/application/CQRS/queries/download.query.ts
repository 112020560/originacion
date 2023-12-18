/* eslint-disable prettier/prettier */
import { SolicitudDocumentoRepository } from '@app/infrastructure/f2pglobal/repositories/documents.reporistory';
import { FileServiceInterface } from '@app/infrastructure/storage/interfaces/fileservice.interface';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler,QueryHandler } from '@nestjs/cqrs';
import { DonwloadFileModel } from 'apps/solicitud/src/domain/models/downloadfile.model';
import { DownloadFileDto } from '../../dtos/downloadfile.sto';
export class DownloadFileQuery implements IQuery {
    constructor(public readonly dto: DownloadFileDto) { }
}

@QueryHandler(DownloadFileQuery)
export class DownloadFileHandler implements IQueryHandler<DownloadFileQuery, DonwloadFileModel> {
    constructor(
        @Inject('FileServiceInterface') private readonly azureBlobService: FileServiceInterface,
        private readonly solicitudDocumentoRepository: SolicitudDocumentoRepository
    ) { }
    async execute(query: DownloadFileQuery): Promise<DonwloadFileModel> {
        const file = await this.azureBlobService.getFile(query.dto.filePath);
        const filerow = await this.solicitudDocumentoRepository.findByCondition({ where: { fkMtrSolicitud: { id: query.dto.id_Solicitud }, nombreDocumento: query.dto.fileName } })
        if (filerow) {
            return { fileContent: file, fileheader: filerow.header }
        } else {
            throw new Error('El documento a descargar no cuenta con Content-Type configurado');
        }
    }
}