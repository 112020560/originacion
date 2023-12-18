/* eslint-disable prettier/prettier */
import { EventLogContract, UpdateStatusContract } from "@app/shared/contracts";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { SolicitudInterfaceRepository } from "../../domain/interfaces/solicitud.interface";
import { EventLogService } from "../eventlog.service";

export abstract class EventExtension {
    readonly eventlogRepository: EventLogService;
    readonly isolicitudRepository: SolicitudInterfaceRepository
    constructor(isolicitudRepository: SolicitudInterfaceRepository, eventlogRepository: EventLogService) {
        this.isolicitudRepository = isolicitudRepository
        this.eventlogRepository = eventlogRepository
    }

    public async  sendEventLog(accionType: AcctionType, idsolicitud: number, date: Date, user: string, eventDescription: string) {
        const event: EventLogContract = {
            AcctionType: accionType,
            FechaLocal: date,
            Id_Solicitud: idsolicitud,
            Usuario: user,
            Observacion: `VERIFICACION CORRECTA DEL PIN`
        }
        await this.eventlogRepository.createEventLog(event);
    }

    public async sendUpdateStatus(idsolicitud: number, date: Date, user: string, statusKey: string) {
        const payload: UpdateStatusContract = {
            id_solicitud: idsolicitud,
            fecha: date,
            usuario: user,
            statusKey: '',
            substatusKey: statusKey
        }

        await this.isolicitudRepository.updateStatus(payload);
    }
}