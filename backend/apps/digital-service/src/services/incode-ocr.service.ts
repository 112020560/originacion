/* eslint-disable prettier/prettier */

import { IncodeProviderInterfaceService } from '@app/infrastructure/api/incode/interfaces/incodeprovider.interface';
import { Digital } from '@app/infrastructure/mongodb/entities/partial-entities/digital.entity';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClientProxy } from '@nestjs/microservices';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { LinkSolicitudRepository } from '@app/infrastructure/mongodb/repositories/linksolicitud.repository';
import { ProcessIncodeDto } from '@app/shared/contracts/incode.contract';
import { ServicesEventExtension } from './abstract/services.abstract';
import { IIncodeOcrService } from '../domain/interfaces/incodeocr.interface';

@Injectable()
export class IncodeOcrService extends ServicesEventExtension implements IIncodeOcrService {
    private readonly logger = new Logger(IncodeOcrService.name);
    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        //ESTE SE DEBE DE INYECTAR
        private readonly linkRepository: LinkSolicitudRepository,
        @Inject('CORE_SERVICE')
        readonly clientProxyRMQ: ClientProxy
        
    ) {
        super(folioRepository, clientProxyRMQ);
    }

    public getIncodeOcrData = async (dto: ProcessIncodeDto): Promise<boolean> => {
        const id_solicitud = dto.id_Solicitud;
        this.logger.log(`Solicitud: ${id_solicitud} Descargando OCR-DATA`);
        try {
            if (dto.id_Sesion_Digital == null || dto.id_Sesion_Digital == undefined) throw Error('Parametro id_Sesion_Digital es requerido')
            //DESCARGAMOS LA INFROMACION DE INCODE
            const ocrResponse = await this.IncodeProvider.getOcrDataAsync(
                {
                    oauthPayload: {
                        countryCode: "ALL",
                        interviewId: dto.id_Sesion_Digital
                    }, payload: {
                        Id_Sesion: dto.id_Sesion_Digital,
                    }
                });
            //VALIDAMOS QUE VENGA INFORMACION EN LA RESPUESTA
            if (ocrResponse) {
                const folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
                //ASOCIAMOS AL FOLIO LA RESPUESTA DEL PROVEEDOR
                const digital: Digital[] = [
                    {
                        fechaFlujo: new Date(dto.fechaLocal).toISOString(),
                        flujo: dto.flujo,
                        Tipo: 'OCR',
                        unixFechaLocal: Math.floor(new Date(dto.fechaLocal).getTime() / 1000),
                        InformacionFlujo: JSON.stringify(ocrResponse)
                    }
                ];

                

                await this.folioRepository.update({
                    _id: new ObjectId(folio.id)
                }, {
                    $set: {
                        flujoDigital: folio.flujoDigital ? folio.flujoDigital.concat(digital) : digital,
                        updateDate: dto.fechaLocal,
                        userUpdate: dto.usuario
                    }
                })

                //SE ENVIA EL EVENTO 
                this.sendEventLog(AcctionType.DOCUMENTO_DIGITAL, id_solicitud, dto.fechaLocal, dto.usuario, `DESCARGA DE LA OCR DATA DESDE INCODE PARA EL FLUJO ${dto.flujo}`)
                //REGLAS CREADAS POR NEGOCIO - RIESGOS
                //REGLA DE VALIDACION DE CURP
                if (dto.flujo && dto.flujo == 'biometric') {
                    console.log('por lo menos entre');
                    this.logger.log(`Solicitud: ${id_solicitud} - Comparacion CURP solicitud ${folio.kyc.informacionPersonal.Curp} contra CURP OCR-DATA ${ocrResponse.ocrData.curp}`);
                    if (folio.kyc.informacionPersonal.Curp.toUpperCase() != ocrResponse.ocrData.curp.toUpperCase()) {
                        this.logger.error(`Solicitud: ${id_solicitud} - Validacion de CURP fallida`);
                        let estado = 'ERROR-CURP'
                        let errorMessage = `EL CURP DE LA SOLICITUD [ ${folio.kyc.informacionPersonal.Curp} ] NO COINCIDE CON EL CURP DE LA VERIFICACION BIOMETRICA ${ocrResponse.ocrData.curp}`
                        //VALIDACION SI EL CURP MAS BIEN NO PUSO SER LEIDO
                        if(ocrResponse.ocrData.curp.toUpperCase() == '') {
                            estado = 'CURP-VACIO';
                            errorMessage = `No se encontró el curp en la imagen del INE`;
                        }
                        //ACTUALIZAMOS EL LINK PARA QUE NO PUEDA VANAZAR
                        await this.linkRepository.update(
                            {
                                Id_Solicitud: id_solicitud,
                                Tipo: dto.flujo,
                                Estado: { $in : [ 'ACTIVO', 'NUEVO', 'PROCESO'] }
                            }, {
                            $set: {
                                Estado: estado,
                                Observacion: errorMessage
                            }
                        });
                        //ENVIAMOS LOG DE EVENTOS
                        this.sendEventLog(AcctionType.ERROR_CURP, id_solicitud, dto.fechaLocal, dto.usuario, errorMessage);
                        //CAMBIAMOS EL ESTADO DE LA SOLICITUD
                        this.sendUpdateStatus(id_solicitud, dto.fechaLocal, dto.usuario, 'ERR-CURP')
                    }
                } else {
                    //TODO:: con socket notificar al front
                    this.logger.log(`Solicitud: ${id_solicitud} - Validacion de CURP Satisfactoria`)
                    this.sendEventLog(AcctionType.VALIDACION_FECHA_VENCIMIENTO_DOMICILIO, id_solicitud, dto.fechaLocal, dto.usuario, 'VALIDACION CURP EXITOSO')
                }

                //REGLA DE VALIDACION DE FECHA DOCUMENTO DOMICILIO Y TIPO DE DOCUMENTO
                if (dto.flujo && dto.flujo == "recidence") {

                    //VALIDACION FECHA DE DOCUMENTO
                    this.logger.log(`Solicitud: ${id_solicitud} - Inicio validaciones a documento de Domicilio`)
                    const ocrDate = new Date(ocrResponse.ocrData.addressStatementEmissionDate * 1000);
                    const compareDate = new Date();
                    compareDate.setMonth(compareDate.getMonth() - 3)
                    if (ocrDate >= compareDate) {
                        this.sendEventLog(AcctionType.VALIDACION_FECHA_VENCIMIENTO_DOMICILIO, id_solicitud, dto.fechaLocal, dto.usuario, 'VALIDACION DE DOCUMENTO DE DOMICILIO EXITOSO')
                        this.logger.log('VALIDACION DE DOCUMENTO DE DOMICILIO EXITOSO');
                    } else {
                        //TODO::NOTIFICAR POR SOCKET
                        const errorMessage = `Solicitud: ${id_solicitud} - Fecha de documento fuera de rango: ${ocrDate}`
                        this.logger.error(errorMessage)
                        //ACTUALIZAMOS EL LINK PARA QUE NO PUEDA VANAZAR
                        await this.linkRepository.update(
                            {
                                Id_Solicitud: id_solicitud,
                                Tipo: dto.flujo,
                                Estado: 'ACTIVO'
                            }, {
                            $set: {
                                Estado: 'ERROR-FECHA_DOC',
                                Observacion: 'Lo sentimos, tu link se ha desactivado ya que la fecha del documento de domicilio no esta dentro del rango permitido.'
                            }
                        });

                        //ENVIAMOS LOG DE EVENTOS
                        this.sendEventLog(AcctionType.ERROR_FLUJO_DOMICILIO, id_solicitud, dto.fechaLocal, dto.usuario, errorMessage);
                        //CAMBIAMOS EL ESTADO DE LA SOLICITUD
                        this.sendUpdateStatus(id_solicitud, dto.fechaLocal, dto.usuario, 'ERR-DOC-DOMICILIO')
                    }

                    //VALIDACION TIPO DOCUMENTO
                    //DOCUMENTO PERMITIDOS 
                    const documents: string[] = ["CFE", "TELMEX", "TOTAL PLAY", "IZZI"];
                    //DOCUMENTO ENVIANDO
                    if (ocrResponse.ocrData.documentType) {
                        const doctype = ocrResponse.ocrData.documentType;
                        if (!documents.find(x => x == doctype.toUpperCase())) {
                            const errorMessage = `${id_solicitud} -TIPO DE DOCUMENTO [ ${doctype} ] NO ES PERMITIDO`
                            this.logger.error(errorMessage);
                            //ENVIAMOS LOG DE EVENTOS
                            this.sendEventLog(AcctionType.ERROR_TIPO_DOCUMENTO_DOMICILIO, id_solicitud, dto.fechaLocal, dto.usuario, errorMessage)
                            //CAMBIAMOS EL ESTADO DE LA SOLICITUD
                            this.sendUpdateStatus(id_solicitud, dto.fechaLocal, dto.usuario, 'DOC_DOMI_ERROR');
                        } else {
                            this.logger.log(`TIPO DE DOCUMENTO [ ${doctype} ]  PERMITIDO`)
                            this.sendEventLog(AcctionType.TIPO_DOCUMENTO_DOMICILIO_VALIDADO, id_solicitud, dto.fechaLocal, dto.usuario, 'TIPO DOCUMENTO VALIDADO CON EXITO')
                        }
                    } else {
                        this.logger.warn('LA PROPIEDAD documentType VIENE NULA')
                    }
                }
                return true
            } else {
                this.logger.error(`EL PROCESO DE DESCARGA DEL OCR NO PRODUJO RESULTADOS`);
                return false
            }
        } catch (error) {
            this.logger.error(`ERROR EN EL PROCESO DE DESCARGA DEL OCR DATA: ${JSON.stringify({ error })}`)
            this.sendEventLog(AcctionType.ERROR_FLUJO_DOMICILIO, id_solicitud, dto.fechaLocal, dto.usuario, 'ERROR AL PROCESAR DOCUMENTO DOMICILIO')
            return false;
        }

    }
}
