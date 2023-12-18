/* eslint-disable prettier/prettier */
import { EVENT_LOG, SOLICITUD_DOCUMENTO, UPDATE_INFORMATION, UPDATE_STATUS } from "@app/shared/Const/events.const";
import { EventLogContract, UpdateContract, UpdateStatusContract } from "@app/shared/contracts";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { IEventDriveService } from "./interfaces/eventdrive.interface";

@Injectable()
export class EventDriveService implements IEventDriveService {
    constructor(
        @Inject('CORE_SERVICE') private readonly coreProxy: ClientProxy,
    ){}

    public sendEventLog(accionType: AcctionType, idsolicitud: number, date: Date, user: string, eventDescription: string) {
        const event: EventLogContract = {
            AcctionType: accionType,
            FechaLocal: date,
            Id_Solicitud: idsolicitud,
            Usuario: user,
            Observacion: eventDescription
        }
        this.coreProxy.emit(EVENT_LOG, event);
    }

    public sendUpdateStatus(idsolicitud: number, date: Date, user: string, statusKey: string) {
        const payload: UpdateStatusContract = {
            id_solicitud: idsolicitud,
            fecha: date,
            usuario: user,
            statusKey: '',
            substatusKey: statusKey
        }

        this.coreProxy.emit(UPDATE_STATUS, payload)
    }

    public sendUpdateInformation(idsolicitud: number, date: Date, user: string, extaernalReference: string) {
        const payload: UpdateContract = {
            Id_Solicitud: idsolicitud,
            FechaLocal: date,
            Usuario: user,
            external_reference: extaernalReference,
        }

        this.coreProxy.emit(UPDATE_INFORMATION, payload)
    }

    public registerDocument(solicitud: number, docName: string, path: string, contentType: string,type: string, date: Date, user: string) {
        const notificationDocument = {
            FK_MTR_SOLICITUD: solicitud,
            NOMBRE_DOCUMENTO: docName,
            RUTA_DOCUMENTO: path,
            ESTADO_DOCUEMNTO: 'CARGADO',
            FECHA_INGRESO_DOCUMENTO: date,
            TIPO_DOCUMENTO: type,
            USUARIO: user,
            HEADER: contentType
        }

        this.coreProxy.emit(SOLICITUD_DOCUMENTO, notificationDocument);
    }
}