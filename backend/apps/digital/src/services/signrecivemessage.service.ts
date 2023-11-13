/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from "@app/infrastructure/api/incode/interfaces/incodeprovider.interface";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { SignError } from "../application/dtos/sign-off-error";
import { SignOffDto } from "../application/dtos/sign-off.dto";
import { IncodeAbstract } from "./abstract/incode.abstract";

@Injectable()
export class SignReciveExternalMessage extends IncodeAbstract {
    private readonly logger = new Logger(SignReciveExternalMessage.name);

    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('FolioInterfaceRepository')
        private readonly folioRepository: FolioInterfaceRepository,
        @Inject('CORE_SERVICE')
        readonly clientProxyRMQ: ClientProxy,
        @Inject('DIGITAL_SERVICE')
        readonly digitalProxy: ClientProxy,
    ) { 
        super(clientProxyRMQ, digitalProxy)
    }
    @RabbitSubscribe({
        exchange: 'sign.events',
        routingKey: '.sign_off',
        queue: 'queue.circulo-credito.sign_off',
    })
    public async signOff(msg: SignOffDto) {
        this.logger.log(`Received message from SignServiceWorker: ${JSON.stringify(msg)}`);
        this.logger.log(`Solicitud ${msg.Id_Solicitud} SignOff close Incode session`)
        try {
            const folio = await this.folioRepository.findOneByFilter({ id_request: msg.Id_Solicitud });
            if (folio) {
                const response = await this.IncodeProvider.startSessionAsync({
                    countryCode: "ALL",
                    interviewId: folio.digitalSesion
                });

                if (response) {
                    const finishStatusResponse = await this.IncodeProvider.finishStatusAsync({
                        oauthPayload: {
                            countryCode: "ALL",
                            interviewId: folio.digitalSesion
                        },
                        payload: {}
                    });
                this.logger.log("Finish Status Response:", JSON.stringify(finishStatusResponse));
                }

                this.actionLog(AcctionType.FINALIZA_SESION_INCODE, msg.Id_Solicitud, new Date(), folio.userCreate, "FINALIZA Y CIERRA SESION EN INCODE");
            }
        } catch (error) {
            this.logger.error(`Error al finalizar la sesion de Incode para la solicitud ${msg.Id_Solicitud}: Error ${error}`);
        }
    }

    @RabbitSubscribe({
        exchange: 'sign.events',
        routingKey: '*.sign_error',
        queue: 'sign_process_error',
    })
    public async registerSingError(msg:SignError){
        this.logger.log(`Received message from SignServiceWorker: ${JSON.stringify(msg)}`);
        this.logger.error(`Solicitud ${msg.Id_Solicitud} Error en el proceso de firma, paso : ${msg.Step}, Error: ${msg.Message} `)
        //ENVIAMOS EL LOG DEL EVENTO
        this.actionLog(AcctionType.ERROR_FIRMA_DOCUMENTO, msg.Id_Solicitud, new Date(), 'worker.sign', msg.Message );
        //CAMBIAMOS EL STATUS DE LA SOLICITUD
        this.updateStatus(msg.Id_Solicitud, new Date(), 'worker.sign', "ERROR_SIGN") //TODO:: CREAR SUBSTATUS
    }
}