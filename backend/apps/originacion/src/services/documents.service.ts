/* eslint-disable prettier/prettier */
import { MtrSolicitudDocumento } from '@app/infrastructure/f2pglobal/entities/MtrSolicitudDocumento';
import { SolicitudDocumentoRepository } from '@app/infrastructure/f2pglobal/repositories/documents.reporistory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentoSolicitudService {
    constructor(private readonly docRepository: SolicitudDocumentoRepository) { }

    public async insertDocumentoSolicitud(entity: MtrSolicitudDocumento): Promise<void> {
        await this.docRepository.save(entity);
    }
}
