/* eslint-disable prettier/prettier */
import { OtpInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/otp.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpGenerateDto } from '../application/dtos/otpgenerate.dto';
import { ValidateOtp } from '../domain/models/validateotp.model';
import { ObjectId } from 'mongodb';
import { OtpInterfaceService } from './interfaces/otpservice.interface';
import { ServicesEventExtension } from './abstract/services.abstract';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { ClientProxy } from '@nestjs/microservices';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { BackendParam } from '@app/infrastructure/api/backend/models/backend.params';
import { BackendInterfaceService } from '@app/infrastructure/api/backend/interfaces/backend.interface';
import { BackendDataBase, BackendRequestType, DataBaseEngine } from '@app/shared/enums/backendmethod.enum';
import { TagDto } from '../domain/models/tags.model';
import { PlantillaSmsResponse } from '../domain/models/template.model';
import { SmsNotificationContract } from '@app/shared/contracts/sms.contract';
import { EmailNotificationContract } from '@app/shared/contracts/email.contract';
import { Folio } from '@app/infrastructure/mongodb/entities/folio.entity';
import { IEventDriveService } from './interfaces/eventdrive.interface';


@Injectable()
export class OtpService  implements OtpInterfaceService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject("CORE_SERVICE")
        readonly coreproxy: ClientProxy,
        @Inject("NOTIFICATION_SERVICE")
        readonly notificationProxy: ClientProxy,
        private configService: ConfigService,
        @Inject('OtpInterfaceRepository')
        private readonly repository: OtpInterfaceRepository,
        @Inject('BackendInterfaceService')
        private readonly backendService: BackendInterfaceService,
        @Inject('IEventDriveService')
        private readonly eventService: IEventDriveService
    ) {}

    public async otpGenerate(dto: OtpGenerateDto): Promise<string> {
        this.logger.log(`${dto.id_Solicitud} - Generando OTP`);
        let mensaje = '';
        const min = 0;
        const max = 9;
        const length = this.configService.get<number>('OTP_LENGTH')
        const timeExpires = this.configService.get<number>('OTP_TIME_EXPIRES')
        const retries = this.configService.get<number>('OTP_SEND_RETRIES')
        let otp = ''
        const expiresDate = new Date(dto.fechaLocal);
        console.log('expiresDate', expiresDate)
        console.log('timeExpires', timeExpires)
        expiresDate.setDate(new Date(expiresDate).getDate() + timeExpires)

        for (let i = min; i < length; i++) {
            otp += Math.floor(Math.random() * max)
        }
        mensaje = otp;

        const otpRecord = await this.repository.findOneByFilter({ id_Solicitud: dto.id_Solicitud })
        if (!otpRecord) {
            await this.repository.create({
                createAt: dto.fechaLocal,
                dueDate: expiresDate,
                id_Solicitud: dto.id_Solicitud,
                otp: otp,
                retrys: 0,
                status: 'ACTIVO',
                userName: dto.usuario,
            })
        } else {
            if (otpRecord.retrys <= retries) {
                await this.repository.update({ _id: new ObjectId(otpRecord.id) }, {
                    $set: {
                        otp: otp,
                        dueDate: expiresDate,
                        retrys: otpRecord.retrys + 1,
                        status: 'ACTIVO',
                        updateAt: dto.fechaLocal,
                        userUpdate: dto.usuario
                    }
                })
            } else {
                await this.repository.update({ _id: new ObjectId(otpRecord.id) }, {
                    $set: {
                        status: 'CANCELADO',
                        updateAt: dto.fechaLocal,
                        userUpdate: dto.usuario
                    }
                });
                //ENVIALOS LOG DE EVENTOS
                this.eventService.sendEventLog(AcctionType.ERROR_VERIFICACION_OTP, dto.id_Solicitud, dto.fechaLocal, dto.usuario, 'SE EXEDIO EL MAXIMO DE INTENTOS DE ENVIO');
                //ENVIAMOS A MODIFICAR EL STATUS
                this.eventService.sendUpdateStatus(dto.id_Solicitud, dto.fechaLocal, dto.usuario, 'ERROR-PIN');
                this.logger.error(`${dto.id_Solicitud} - HA EXEDIDO EL MAXIMO CONFIGURADO PARA LOS INTENTOS DE ENVIO DEL OTP`)
                throw new Error("HA EXEDIDO EL MAXIMO CONFIGURADO PARA LOS INTENTOS DE ENVIO DEL OTP");
            }
            //ENVIAMOS LAS NOTIFICACIONES
            await this.SendLinkNotification(dto.id_Solicitud, otp);

            //ENVIALOS LOG DE EVENTOS
            this.eventService.sendEventLog(AcctionType.CODIGO_OTP_ENVIADO, dto.id_Solicitud, dto.fechaLocal, dto.usuario, `PIN ${otp} ENVIADO CON FECHA VENCIMIENTO ${expiresDate}`)
            this.logger.log(`${dto.id_Solicitud} -  Cambio de subestado a [VALIDA-PIN] `);
            //CAMBIO DE ESTADO
            this.eventService.sendUpdateStatus( dto.id_Solicitud, dto.fechaLocal, dto.usuario,'VALIDA-PIN');
        }

        return otp;
    }

    // Generate and save a one time password for the given Id Solicitude to be used in
    public async otpValidate(dto: OtpGenerateDto): Promise<ValidateOtp> {
        const enableOtpValidate = this.configService.get<number>('ENABLE_OTP_VALIDATE')
        if (enableOtpValidate == 1) {
            const otpRecord = await this.repository.findOneByFilter({ id_Solicitud: dto.id_Solicitud, otp: dto.otp });
            if (otpRecord && otpRecord.otp) {
                switch (otpRecord.status) {
                    case 'ACTIVO':
                        {
                            if (new Date(dto.fechaLocal) <= otpRecord.dueDate) {
                                await this.repository.update({ id: new ObjectId(otpRecord.id) }, {
                                    $set: {
                                        status: 'VERIFICADO',
                                        updateAt: dto.fechaLocal,
                                        userUpdate: dto.usuario
                                    }
                                });
                                return {
                                    validate: true,
                                    message: "Validación exitosa"
                                };
                            } else {
                                await this.repository.update({ id: new ObjectId(otpRecord.id) }, {
                                    $set: {
                                        status: 'VENCIDO',
                                        updateAt: dto.fechaLocal,
                                        userUpdate: dto.usuario
                                    }
                                });
                                return {
                                    validate: false,
                                    message: "OTP VENCIDO"
                                };
                            }
                        }
                    case 'VERIFICADO': {
                        return {
                            validate: true,
                            message: 'PIN YA FUE VERIFICADO'
                        }
                    }
                    case 'VENCIDO': {
                        return {
                            validate: false,
                            message: 'OTP VENCIDO'
                        }
                    }
                    case 'CANCELADO': {
                        return {
                            validate: false,
                            message: 'OTP ALCANZO EL MAXIMO DE REINTENTOS'
                        }
                    }
                    default:
                        return {
                            validate: false,
                            message: 'ESTADO DEL OTP NO VALIDO'
                        }
                }
            } else {
                return {
                    validate: false,
                    message: 'El PIN NO EXITE O YA FUE UTILIZADO'
                }
            }
        } else {
            return {
                validate: true,
                message: 'SE HA DESHABILITADO LA VERIFICACION DEL PIN'
            }
        }
    }

    private async SendLinkNotification(idSolicitud: number, otp: string): Promise<void> {
        const folio: Folio = await this.folioRepository.findOneByFilter({id_request: idSolicitud})
        const enableSendEmal = this.configService.get<number>('OTP_ENABLE_SEND_EMAIL')
        this.logger.debug(`enableSendEmal: ${enableSendEmal}`);
        const enableSendSMS = this.configService.get<number>('OTP_ENABLE_SEND_SMS')
        this.logger.debug(`enableSendSMS: ${enableSendSMS}`);
        const baseUrlClient = this.configService.get<string>('FRONT_CLIENT_URL')
        this.logger.debug(`baseUrlClient: ${baseUrlClient}`);
        const link1 = `${baseUrlClient}info/terms-conditions`;
        const link2 = `${baseUrlClient}info/privacy`; 

        if (enableSendSMS == 1) {
            this.logger.log('ENVIO DE NOTIFICACION SMS')
            const backendParameter: BackendParam[] = [];
            const tags: TagDto[] = [];

            tags.push({ Tag: "[OTP]", Value: otp });
            tags.push({ Tag: "[LINK_TERMINOS]", Value: link1 });
            tags.push({ Tag: "[LINK_PRIVACIDAD]", Value: link2 });

            backendParameter.push({ Parametro: 'P_LLAVE', Valor: 'link_incode_pin' })
            backendParameter.push({ Parametro: 'P_TAGS', Valor: JSON.stringify(tags) })

            const respPlantilla = await this.backendService.sendBackendRequest<PlantillaSmsResponse[]>({
                ApplicationId: 'ventas-mx',
                Country: 'MX',
                DataBase: BackendDataBase.CORE,
                Engine: DataBaseEngine.MSSQL,
                Flag: 0,
                Params: backendParameter,
                Metodo: BackendRequestType.GET,
                Procedimiento: "PA_CON_INFO_PLANTILLA_SMS",
                Columns: []
            })

            const smsContract: SmsNotificationContract = {
                messageBody: respPlantilla[0].Plantilla,
                phoneNumber: folio.kyc.informacionPersonal.TelefonoCelular,
            }

            this.notificationProxy.emit('notification_sms', smsContract);
        }

        if (enableSendEmal == 1) {
            this.logger.log('ENVIO DE NOTIFICACION EMAIL')
            const emailContract: EmailNotificationContract = {
                identificationNumber: folio.kyc.informacionPersonal.Curp,
                content: `|${otp}`,
                emailAddress: folio.kyc.informacionPersonal.CorreoElectronico,
                template: '16' //TODO:: Esto debe de ir dinamico
            }

            this.notificationProxy.emit('notification_email', emailContract);
        }
    }
}
