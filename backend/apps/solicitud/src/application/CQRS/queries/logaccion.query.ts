/* eslint-disable prettier/prettier */
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LogAccionSolicitudModel } from 'apps/solicitud/src/domain/models/logaccion.model';
import { Logger } from '@nestjs/common';
import { Response } from 'apps/solicitud/src/domain/wrappers/response';
import { LogAccionRepository } from '@app/infrastructure/f2pglobal/repositories/logaccion.repository';
export class LogAccionQuery implements IQuery {
    constructor(public readonly id_solicitud: number) { }
}

@QueryHandler(LogAccionQuery)
export class LogAccionHandler implements IQueryHandler<LogAccionQuery, Response<LogAccionSolicitudModel[]>> {
    constructor(private readonly repository: LogAccionRepository) { }

    async execute(query: LogAccionQuery): Promise<Response<LogAccionSolicitudModel[]>> {
        const events = await this.repository.findAll({ where: { fkMtrSolicitud: { id: query.id_solicitud } }, relations: {fkMtrSolicitud: true} });
        return {
            Success: true,
            Data: events.map(event => {
                return {
                    ID: event.id,
                    ACCION: event.accion,
                    DESCRIPCION: event.descripcion,
                    FECHA_ACCION: event.fechaAccion.toISOString(),
                    FK_MTR_SOLICITUD: event.fkMtrSolicitud.id,
                    USUARIO: event.usuario,
                    FLAG: event.accion.includes('ERROR') ? 'ERROR' : event.accion.includes('RECHAZO') ? 'WARNING' : 'SUCCESS',
                }
            }) as  LogAccionSolicitudModel[]
        }
    }
}

