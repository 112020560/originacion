/* eslint-disable prettier/prettier */
import { BackendInterfaceService } from '@app/infrastructure/api/backend/interfaces/backend.interface';
import { BackendParam } from '@app/infrastructure/api/backend/models/backend.params';
import { TwilioInterfaceService } from '@app/infrastructure/api/twilio/interfaces/twilio.interface';
import { EmailNotificationContract } from '@app/shared/contracts/email.contract';
import { SmsNotificationContract } from '@app/shared/contracts/sms.contract';
import { BackendDataBase, BackendRequestType, DataBaseEngine } from '@app/shared/enums/backendmethod.enum';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('TwilioInterfaceService')
    private readonly twilioService: TwilioInterfaceService,
    @Inject('BackendInterfaceService')
    private backendService: BackendInterfaceService,
  ) { }

  async sendSms(contract: SmsNotificationContract): Promise<void> {
    await this.twilioService.sendSms(contract);
  }

  async sendEmail(emailContract: EmailNotificationContract) {
    const params: BackendParam[] = [];
    params.push({ Parametro: "P_NUM_IDENT", Valor: emailContract.identificationNumber });
    params.push({ Parametro: "P_EMAIL_DESTINO", Valor: emailContract.emailAddress });
    params.push({ Parametro: "P_CONTENT", Valor: emailContract.content });
    params.push({ Parametro: "P_CAMPA", Valor: emailContract.template });
    params.push({ Parametro: "P_MARCA", Valor: 1 });

    await this.backendService.sendBackendRequest<any>({
      ApplicationId: 'ventas-mx',
      Columns: [],
      Country: 'MX',
      DataBase: BackendDataBase.CORE,
      Engine: DataBaseEngine.MSSQL,
      Flag: 0,
      Metodo: BackendRequestType.GET,
      Params: params,
      Procedimiento: 'PA_PRO_ENVIO_CORREO_SUCV'
    })
  }
}
