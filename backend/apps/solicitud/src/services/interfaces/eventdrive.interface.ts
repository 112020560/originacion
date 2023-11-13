/* eslint-disable prettier/prettier */
import { AcctionType } from "@app/shared/enums/eventlog.enum";

export interface IEventDriveService {
    sendEventLog(accionType: AcctionType, idsolicitud: number, date: Date, user: string, eventDescription: string): void;
    sendUpdateStatus(idsolicitud: number, date: Date, user: string, statusKey: string): void;
    sendUpdateInformation(idsolicitud: number, date: Date, user: string, extaernalReference: string): void;
    registerDocument(solicitud: number, docName: string, path: string, contentType: string,type: string, date: Date, user: string): void;
}