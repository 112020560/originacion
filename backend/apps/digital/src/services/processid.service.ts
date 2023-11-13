/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from "@app/infrastructure/api/incode/interfaces/incodeprovider.interface";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { IncodeAbstract } from './abstract/incode.abstract';
import mongoose from 'mongoose';
import { commonIncodeDto } from "../application/dtos/incode.dto";
import { GenericPayload } from "@app/infrastructure/api/incode/models/generic.payload";
import { ProcesosIncodeModel } from "@app/infrastructure/api/incode/models/processid.model";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { IProcessIdService } from "../domain/interfaces/processid.interface";
import { ProcessIdResponse } from "@app/infrastructure/api/incode/models/processid.response";
import { INCODE_GET_OCR_DATA } from "@app/shared/Const/events.const";

@Injectable()
export class ProcessIdServices extends IncodeAbstract implements IProcessIdService {
    private readonly logger = new Logger(ProcessIdServices.name);

    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('DIGITAL_SERVICE')
        readonly digitalProxy: ClientProxy,
        @Inject('CORE_SERVICE')
        readonly coreProxy: ClientProxy,
        @Inject('FolioInterfaceRepository') readonly folioRepository: FolioInterfaceRepository,
        private configService: ConfigService,
    ) {
        super(coreProxy, digitalProxy)
        mongoose.set('debug', true);
    }

    processDocumentId = async (dto: commonIncodeDto): Promise<boolean> => {
        if (!dto.token) throw new Error('Token is required');
        this.logger.log(`Start DocumentId validation Token = ${dto.token}`);
        //PROCESO DE VALIDACION DEL TOKEN
        const validacionUrl = await this.validateTokenUrl(dto.token, dto.fechaLocal);
        if (validacionUrl && validacionUrl.Validado) {
            const id_solicitud = validacionUrl.Id_Solicitud;
            this.logger.log(`ProcessProviderId | ${id_solicitud} | TOKEN URL VALIDADO CON EXITO`)
            //SE CREA PAYLOAD PARA INCODE
            const payload: GenericPayload<ProcesosIncodeModel> = {
                //PAYLOAD PARA AUTENTICAR 
                oauthPayload: {
                    countryCode: "ALL",
                    interviewId: dto.interviewId
                },
                //PAYLOAD DEL PROCESO
                payload: {
                    InterviewId: dto.interviewId
                }
            }
            //ENVIAMOS PETICION INCODE
            const processIdResponse: ProcessIdResponse = await this.IncodeProvider.processIdAsync(payload);
            if (processIdResponse.success) {
                //SI SE PROCESO BIEN REALIZAMOS EL FLUJO GUBERNAMENTAL
                //ENVIAMOS EL LOG DE ACCION
                this.actionLog(AcctionType.VALIDACION_BIOMETRICA, id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'LA VALIDACION BIOMETRICA SE REALIZO SATISFACTORIAMENTE')
                if (this.configService.get<number>('GOVERNAMEN_OFFLINE') == 1) {
                    //SE ENVIA PROCESO GUBERNAMENTAL
                    this.logger.log(`${id_solicitud} - PROCESO GOBIERNO OFFLINE`);
                    this.IncodeProvider.processGovernmentAsync(
                        {
                            oauthPayload: {
                                countryCode: "ALL",
                                interviewId: dto.interviewId
                            },
                            payload: {}
                        }
                    )
                } else {
                    this.logger.log(`${id_solicitud} - PROCESO GOBIERNO ONLINE`);
                    //MANDAMOS A DESCARGAR LA OCRDATA PARA SUS VALIDACIONES
                    this.sendIncodeProcess(INCODE_GET_OCR_DATA, {
                                                                    token: dto.token,
                                                                    id_Solicitud: id_solicitud,
                                                                    fechaLocal: dto.fechaLocal,
                                                                    flujo: dto.flujo,
                                                                    id_Sesion_Digital: dto.interviewId,
                                                                    usuario: validacionUrl.Usuario_Solicitud
                                                                });

                }

                return processIdResponse.success
            } else {
                this.actionLog(AcctionType.ERROR_VERIFICACION_BIOMETRICA, id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'LA VALIDACION EN INCODE FALLO')
                return false;
            }
        } else {
            this.logger.log(`IncodeStartSessionAsync | ${validacionUrl.Id_Solicitud} | TOKEN URL NO VALIDADO: ${validacionUrl.Mensaje}`);
            //CAMBIAMOS EL SUBESTADO DE LA SOLICITUD
            this.updateStatus(validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'ERR')
            //ENVIAMOS EL LOG DEL MOVIMIENTO 
            this.actionLog(AcctionType.ERROR_VERIFICACION_BIOMETRICA, validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, validacionUrl.Mensaje ?? "Error al validar el token")
            throw Error(validacionUrl.Mensaje ?? "Error al validar el token");
        }

    }
}