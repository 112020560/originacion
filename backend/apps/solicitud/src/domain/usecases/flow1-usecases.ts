/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface'
import { ClientProxy } from '@nestjs/microservices';
import { TranslateInterfaceService } from '@app/infrastructure/api/translate/interfaces/translate.interface';
import { TrasladeResponse } from '@app/infrastructure/api/translate/dto/translateresponse.dto';
import { Buro } from '@app/infrastructure/mongodb/entities/partial-entities/buro.entoty';
import { EventLogContract } from '@app/shared/contracts/eventlog.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { UpdateContract } from '@app/shared/contracts/update.contract';
import { UpdateStatusContract } from '@app/shared/contracts/updatestatus.contract';
import mongoose from 'mongoose';
import { FlujosIngresoDto } from '../../application/dtos/flujos.dto';
import { BlazeRespModel } from '../models/blazeresponse.model';
import { CommonFunctions } from './abstract/blazeflow.abstract';
import { IOneFlowUseCase } from '../interfaces/flujo1.interface';

@Injectable()
export class OneFlowUseCase extends CommonFunctions implements IOneFlowUseCase {

    private readonly logger = new Logger(OneFlowUseCase.name);

    constructor(
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject("CORE_SERVICE")
        readonly coreproxy: ClientProxy,
        @Inject('TranslateInterfaceService')
        private readonly translateService: TranslateInterfaceService
    ) {
        super(folioRepository, coreproxy)
        mongoose.set('debug', true);
    }

    public async execute(solicitudKyCModel: FlujosIngresoDto): Promise<BlazeRespModel> {
        this.logger.log(`Analisis Flujo 1 de blaze para la solicitud ${solicitudKyCModel.id_Solicitud}`)
        const sub_origen = 3;
        const marca = 1;
        const agente = "99";
        const pais = "52";
        let estado = "F1"
        let nombre_completo = solicitudKyCModel.informacion.informacionPersonal.Nombre.trim();
        nombre_completo = nombre_completo.concat(' ', 
                                                solicitudKyCModel.informacion.informacionPersonal.SegundoNombre,
                                                ' ',
                                                solicitudKyCModel.informacion.informacionPersonal.ApellidoPaterno,
                                                ' ',
                                                solicitudKyCModel.informacion.informacionPersonal.ApellidoMaterno);
        //`${solicitudKyCModel.informacion.informacionPersonal.Nombre.trim()} ${solicitudKyCModel.informacion.informacionPersonal.SegundoNombre} ${solicitudKyCModel.informacion.informacionPersonal.ApellidoPaterno} ${solicitudKyCModel.informacion.informacionPersonal.ApellidoMaterno}`
        //SE TRANSFORMA LA FECHA DE UNIX A STANDAR
        const date = new Date(solicitudKyCModel.informacion.informacionPersonal.FechaNacimiento * 1000);

        try {
            //VALIDAMOS QUE EL CORREO y EL TELEFONO NO SE HAYA USADO EN OTRA 
            const regraTelEmail = await this.reglaCorreoTelefono(solicitudKyCModel);
            if (!regraTelEmail) {
                //TODO:: => HAY QUE LLAMAR UN CATALOGO 
                return {
                    Aprobado: false,
                    Codigo: 'ACK510',
                    Mensaje: 'Correo electronico o telefono ya fue utilizado en otra solicitud'
                }
            }
            
            
            const responseFlujo1 = await this.translateService.invokeBlaze<TrasladeResponse>({
                STR_COD_PAIS: pais,
                SIN_FACE: 1,
                STR_NACIONALIDAD: "Mexico_mexicano",
                STR_USUARIO_CREACION: agente,
                INT_SUB_ORIGEN: sub_origen,
                BIN_ID_SOLICITUD_REF: solicitudKyCModel.id_Solicitud,
                GENERO: solicitudKyCModel.informacion.informacionPersonal.Genero,
                STR_CEDULA: solicitudKyCModel.informacion.informacionPersonal.Curp,
                FEC_NACIMIENTO: date.toISOString(),
                INGRESO_BRUTO: solicitudKyCModel.informacion.informacionLaboral.IngresoMensualBruto,
                OCUPACION: solicitudKyCModel.informacion.informacionLaboral.Oficio,
                PROFESION: solicitudKyCModel.informacion.informacionLaboral.Profesion.toString(),
                STR_EMAIL: solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico,
                STR_OCUPACION: solicitudKyCModel.informacion.informacionLaboral.Oficio,
                Fk_Suv_Cat_Marca: 1
            })
            
            const responseCodeF1 = responseFlujo1.F2P_FILE.TRANSACTION_RESPONSE.RESPONSE_CODE;
            
            //SE ACTUALIZA LA INFORMACION DEL KYC Y BURO
            const buro: Buro[] = [
                {
                    buro: 'FLUJO 1 BLAZE (1)',
                    fecha: date,
                    respuesta: JSON.stringify(responseFlujo1)
                }
            ]
            this.GuardarRegistroKyCAsync(solicitudKyCModel, buro)

            //PREPARAMOS LA INFORMACION PARA LA RESPUESTA
            let mensajelog = ''
            let aprobado = false;

            //SI FUE APROBADO POR BLAZE
            if (responseCodeF1 == 'ACK00') {
                this.logger.log(`Solicitud ${solicitudKyCModel.id_Solicitud} - Aprobada flujo 1`)
                estado = 'F1';
                aprobado = true;
                //ENVIAMOS EL EVENTO AL CORE
                const event: EventLogContract = {
                    AcctionType: AcctionType.BLAZE_F1,
                    FechaLocal: date,
                    Id_Solicitud: solicitudKyCModel.id_Solicitud,
                    Usuario: solicitudKyCModel.usuario,
                    Observacion: `Respuesta Flujo 1: ${responseCodeF1}`
                }
                this.coreproxy.emit('eventolog', event);

                mensajelog = responseFlujo1.F2P_FILE?.TRANSACTION_RESPONSE.RESPONSE_DESC;
            } else {
                estado = "RF1";
                mensajelog = responseCodeF1 == "ACK01" ? this.procesarMensajeRespuestaBlaze(responseFlujo1) : responseCodeF1 == "ACK500" ? "CLIENTE YA POSEE VENTA ACTIVA" : "RECHAZO POR REGLAS INTERNAS";
                //ENVIAMOS EL EVENTO AL CORE
                const event: EventLogContract = {
                    AcctionType: AcctionType.RECHAZO_BLAZE_F1,
                    FechaLocal: date,
                    Id_Solicitud: solicitudKyCModel.id_Solicitud,
                    Usuario: solicitudKyCModel.usuario,
                    Observacion: mensajelog
                }
                this.coreproxy.emit('eventolog', event);
                this.logger.warn(`Solicitud ${solicitudKyCModel.id_Solicitud} - Rechazada flujo 1 ${mensajelog}`)
            }

            //RESPUESTA DEL PROCESO
            return {
                Aprobado: aprobado,
                Codigo: responseCodeF1,
                Mensaje: mensajelog
            }


        } catch (error) {
            this.logger.error(`Solicitud ${solicitudKyCModel.id_Solicitud} - Error en flujo 1: ${JSON.stringify({ error })}`)
            estado = "ERROR";
            //ENVIAMOS EL EVENTO AL CORE
            const event: EventLogContract = {
                AcctionType: AcctionType.RECHAZO_BLAZE_F1,
                FechaLocal: date,
                Id_Solicitud: solicitudKyCModel.id_Solicitud,
                Usuario: solicitudKyCModel.usuario,
                Observacion: `Error en flujo 1: ${JSON.stringify({ error })}`
            }
            this.coreproxy.emit('eventolog', event);

            throw new Error(`Error en flujo 1: ${JSON.stringify({ error })}`)
            
        } finally {
            //ACTUALIZAMOS INFORMACION
            const dataUpdate: UpdateContract =  {
                email: solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico,
                FechaLocal: date,
                idOne: solicitudKyCModel.informacion.informacionPersonal.Curp,
                idTwo: solicitudKyCModel.informacion.informacionPersonal.Rfc,
                phone: solicitudKyCModel.informacion.informacionPersonal.TelefonoCelular,
                Id_Solicitud: solicitudKyCModel.id_Solicitud,
                fullName: nombre_completo,
                Usuario: solicitudKyCModel.usuario,
                subStatusKey: estado,
                canalVenta: solicitudKyCModel.informacion.informacionAdicional.CanalVenta
            }

            this.coreproxy.emit('solicitud-update', dataUpdate)
            
            //ACTUALIZAMOS EL ESTADO
            const updateStatus: UpdateStatusContract = {
                fecha: date,
                id_solicitud: solicitudKyCModel.id_Solicitud,
                usuario:  solicitudKyCModel.usuario,
                statusKey: '',
                substatusKey: estado
            }

            this.coreproxy.emit('solicitud-update-status', updateStatus)
        }
    }


    // private async GuardarRegistroKyCAsync(solicitudKyCModel: FlujosIngresoDto, buros: Buro[]): Promise<void> {
    //     //ACTUALIZAMOS REGISTRO MONGO
    //     const folio = await this.folioRepository.findOneByFilter({ id_request: solicitudKyCModel.id_Solicitud, status: 'ACTIVA' })
    //     console.log('folio => ', folio)
    //     if (folio) {
    //         const update = {
    //             informacionPersonal: solicitudKyCModel.informacion.informacionPersonal,
    //             informacionAdicional: solicitudKyCModel.informacion.informacionAdicional,
    //             informacionGeografica: solicitudKyCModel.informacion.informacionGeografica,
    //             informacionLaboral: solicitudKyCModel.informacion.informacionLaboral,
    //             informacionPreguntas: solicitudKyCModel.informacion.informacionPreguntas
    //         }
    //         await this.folioRepository.update({ _id: new ObjectId(folio.id) },
    //             {
    //                 $set: {
    //                     kyc: update,
    //                     buro: buros,
    //                     userUpdate: solicitudKyCModel.usuario,
    //                     updateDate: solicitudKyCModel.fechaLocal
    //                 }
    //             })
    //     }
    // }

    private async reglaCorreoTelefono(solicitudKyCModel: FlujosIngresoDto): Promise<boolean> {
        const folioCorreo = await this.folioRepository.findOneByFilter({ id_request: { $ne: solicitudKyCModel.id_Solicitud }, 'kyc.informacionPersonal.CorreoElectronico': solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico })
        if (folioCorreo) {
            this.logger.error(`El correo erectronico ${solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico} existe en la solicitud ${folioCorreo.id_request}`)
            return false;
        }

        const foliotelefono = await this.folioRepository.findOneByFilter({ id_request: { $ne: solicitudKyCModel.id_Solicitud }, 'kyc.informacionPersonal.TelefonoCelular': solicitudKyCModel.informacion.informacionPersonal.TelefonoCelular })
        if (foliotelefono) {
            this.logger.error(`El telefono ${solicitudKyCModel.informacion.informacionPersonal.TelefonoCelular} existe en la solicitud ${folioCorreo.id_request}`)
            return false;
        }

        return true;
    }

    // private procesarMensajeRespuestaBlaze(responseT: TrasladeResponse): string {
    //     if (responseT.F2P_FILE.MENSAJES_BLAZE && responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE) {
    //         if (Object.prototype.toString.call(responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE) === '[object Array]') {
    //             const messajeListObject = responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE as F2MENSAJE[]
    //             if (messajeListObject && messajeListObject.length > 0) {
    //                 const messageResponse = ''
    //                 messajeListObject.forEach(element => {
    //                     messageResponse.concat(element.MENSAJE_VENTAS);
    //                     messageResponse.concat(' | ')
    //                 });

    //                 return messageResponse;
    //             } else {
    //                 return "RECHAZO POR REGLAS INTERNAS";
    //             }
    //         } else {
    //             const messageObject = responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE as F2MENSAJE
    //             return messageObject?.MENSAJE_VENTAS ?? "RECHAZO NO IDENTIFICADO";
    //         }
    //     } else {
    //         return "RECHAZO POR REGLAS INTERNAS";
    //     }
    // }

}
