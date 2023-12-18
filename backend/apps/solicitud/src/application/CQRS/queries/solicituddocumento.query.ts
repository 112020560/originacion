/* eslint-disable prettier/prettier */
import { MtrSolicitudDocumento } from '@app/infrastructure/f2pglobal/entities/MtrSolicitudDocumento';
import { SolicitudDocumentoRepository } from '@app/infrastructure/f2pglobal/repositories/documents.reporistory';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Response } from '../../../domain/wrappers/response'


export class SolicitudDocumentoQuery implements IQuery {
    constructor(public readonly id_solicitud: number) { }
}

@QueryHandler(SolicitudDocumentoQuery)
export class SolicitudDocumentoHandler implements IQueryHandler<SolicitudDocumentoQuery, Response<MtrSolicitudDocumento[]>> {

    constructor(private readonly repository: SolicitudDocumentoRepository) { }

    async execute(query: SolicitudDocumentoQuery): Promise<Response<MtrSolicitudDocumento[]>> {
        return {
            Success: true,
            Data: await this.repository.findAll({ where: { fkMtrSolicitud: { id: query.id_solicitud } }, order: { id: -1 } }),
            Message: 'Consulta de documentos',
            Errors: null
        }
    }
    // async execute(query: SolicitudDocumentoQuery): Promise<Response<MtrSolicitudDocumento[]>> {

    //     return {
    //         Success: true,
    //         Data: 
    //     }
    // }

}
