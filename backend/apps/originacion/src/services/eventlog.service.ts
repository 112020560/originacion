/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { LogAccionRepository } from '@app/infrastructure/f2pglobal/repositories/logaccion.repository';
import { EventLogContract } from '@app/shared/contracts/eventlog.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';

@Injectable()
export class EventLogService {
    constructor(private readonly repository: LogAccionRepository) { }

    async createEventLog(dto: EventLogContract) {
        await this.repository.save({
            accion: AcctionType[dto.AcctionType],
            descripcion: dto.Observacion,
            fechaAccion: dto.FechaLocal,
            fkMtrSolicitud: {
                id: dto.Id_Solicitud
            },
            usuario: dto.Usuario
        });
    }
}
