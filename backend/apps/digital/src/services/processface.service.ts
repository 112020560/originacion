/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from "@app/infrastructure/api/incode/interfaces/incodeprovider.interface";
import { IncodeProcessFaceResponse } from "@app/infrastructure/api/incode/models/processface.model";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { Inject, Logger, HttpException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import mongoose from "mongoose";
import { commonIncodeDto } from "../application/dtos";
import { IProcessFaceServices } from "../domain/interfaces";
import { IncodeAbstract } from "./abstract/incode.abstract";

export class ProcessFaceServices extends IncodeAbstract implements IProcessFaceServices {
    private readonly logger = new Logger(ProcessFaceServices.name);

    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('DIGITAL_SERVICE')
        readonly digitalProxy: ClientProxy,
        @Inject('CORE_SERVICE')
        readonly coreProxy: ClientProxy,
        @Inject('FolioInterfaceRepository') 
        readonly folioRepository: FolioInterfaceRepository,
    ) {
        super(coreProxy, digitalProxy)
        mongoose.set('debug', true);
    }

    incodeProcessFace = async (dto: commonIncodeDto): Promise<IncodeProcessFaceResponse> => {
        this.logger.log('incodeProcessFace::Inicio')
        //VALIDAMOS EL TOKEN 
        const validacionUrl = await this.validateTokenUrl(dto.token, dto.fechaLocal);
        if(validacionUrl && validacionUrl.Validado == true) {
            const id_solicitud = validacionUrl.Id_Solicitud;
            this.logger.log(`incodeProcessFace::token validado con exito::Solicitud asociada al token: ${id_solicitud} `)
            //MANDAMOS A PROCESAR LA IMAGEN DEL SELFIE
            const incodeProcessFaceResponse = await this.IncodeProvider.processFaceAsync({
                oauthPayload: {
                    countryCode: "ALL",
                    interviewId: dto.interviewId
                },
                payload: {}
            });
            if(incodeProcessFaceResponse) {
                //TODO:: Guardar respuestas de los proveedores
                this.logger.log(`incodeProcessFace:: ${id_solicitud} - Proceso biometrico selfie procesado con exito`)
                //LOG ACCION
                this.actionLog(AcctionType.VALIDACION_BIOMETRICA_SELFIE, id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'VALIDACION BIOMETRICA SELFIE ')
                //CAMBIO DE ESTADO
                this.updateStatus( id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud,'BIOMETRIC_SELFIE')

                return incodeProcessFaceResponse;
            } else {
                //ERROR EN INCODE YA QUE NO SE OBTUVO RESPUESTA
                this.logger.error(`incodeProcessFace:: ${id_solicitud} - Error en proceso biometrico selfie:: Response null or empty`)
                //LOG ACCION
                this.actionLog(AcctionType.ERROR_VALIDACION_BIOMETRICA_SELFIE, id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'VALIDACION SELFIE NO PRODUJO RESULTADOS')
                //CAMBIO DE ESTADO
                this.updateStatus( id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud,'ERROR_SELFIE')

                throw Error('INCODE NO RESPONDIO')
            }
        } else {
           
            //ERROR YA QUE NO SE PUDO VALIDAR EL TOKEN
            if(validacionUrl.Existe) {
                this.logger.error(`incodeProcessFace:: ${validacionUrl.Id_Solicitud} - Error en proceso biometrico selfie:: Response null or empty`)
                 //LOG ACCION
                 this.actionLog(AcctionType.ERROR, validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, validacionUrl.Mensaje)
                 //CAMBIO DE ESTADO
                 this.updateStatus( validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud,'ERROR_SELFIE')
            } else{
                this.logger.error(`incodeProcessFace => Error en proceso biometrico selfie:: ${validacionUrl.Mensaje}`)
            }

            throw Error(validacionUrl.Mensaje)
        }
    
    }
}