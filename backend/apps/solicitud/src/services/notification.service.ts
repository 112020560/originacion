/* eslint-disable prettier/prettier */
import { Inject, Injectable } from "@nestjs/common";
import { ICoreService } from "./interfaces/core.interface";
import { ConfigService } from '@nestjs/config';
import { Folio } from "@app/infrastructure/mongodb/entities/folio.entity";
import { ClientProxy } from "@nestjs/microservices";
import { SmsNotificationContract } from "@app/shared/contracts/sms.contract";
import { EmailNotificationContract } from "@app/shared/contracts/email.contract";
import { INotificationServices } from "./interfaces/notification.interface";

@Injectable()
export class NotificationServices implements INotificationServices {
    constructor(
        private readonly configService: ConfigService,
        @Inject('ICoreService')
        private readonly coreService: ICoreService,
        @Inject('NOTIFICATION_SERVICE')
        private readonly notificationProxy: ClientProxy,
    ) { }

    
    public sendUrlNotification = async (digiltaFlow: string, link: string, folio: Folio): Promise<void> => {
        const enableSendEmal = this.configService.get<number>('LINK_SEND_EMAIL')
        const enableSendSMS = this.configService.get<number>('LINK_SEND_SMS')
        const fullName = `${folio.kyc.informacionPersonal.Nombre} ${folio.kyc.informacionPersonal.SegundoNombre} ${folio.kyc.informacionPersonal.ApellidoPaterno} ${folio.kyc.informacionPersonal.ApellidoPaterno}`

        console.log('enableSendEmal', enableSendEmal)
        console.log('enableSendSMS', enableSendSMS)

        if (enableSendSMS == 1) {
            const offer = folio.offer.slice(-1)[0]
            const respPlantilla = await this.coreService.getTamplete(digiltaFlow, fullName, link, offer);

            const smsContract: SmsNotificationContract = {
                messageBody: respPlantilla[0].Plantilla,
                phoneNumber: folio.kyc.informacionPersonal.TelefonoCelular,
            }

            this.notificationProxy.emit('notification_sms', smsContract);
        }
        if (enableSendEmal == 1) {
            const lastOffer = folio.offer.find(x => x.Activa);
            const emailContract: EmailNotificationContract = {
                identificationNumber: folio.kyc.informacionPersonal.Curp,
                content: `${lastOffer.Monto_venta}| ${fullName}|${link}`,
                emailAddress: folio.kyc.informacionPersonal.CorreoElectronico,
                template: '17' //TODO:: Esto debe de ir dinamico
            }

            this.notificationProxy.emit('notification_email', emailContract);
        }
    }
}