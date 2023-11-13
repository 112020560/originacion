/* eslint-disable prettier/prettier */
import { Folio } from "@app/infrastructure/mongodb/entities/folio.entity";

export interface INotificationServices {
    sendUrlNotification(digiltaFlow: string, link: string, folio: Folio): Promise<void>
}