/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from '@app/infrastructure/api/incode/interfaces/incodeprovider.interface';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { EXECUTE_ALL_EVENTS } from '@app/shared/Const/events.const';
import { ProcessIncodeDto } from '@app/shared/contracts/incode.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import mongoose from 'mongoose';
import { commonIncodeDto } from '../application/dtos';
import { IProcessRecidenceService } from '../domain/interfaces/processrecidence.interface';
import { IncodeAbstract } from './abstract/incode.abstract';

@Injectable()
export class ProcessRecidenceService extends IncodeAbstract implements IProcessRecidenceService {
    private readonly logger = new Logger(ProcessRecidenceService.name);

    constructor(
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

    incodeRecidenceProcess = async (dto: commonIncodeDto): Promise<void> => {
        this.logger.log(`incodeRecidenceProcess::Inicio`);
        const validacionUrl = await this.validateTokenUrl(dto.token, dto.fechaLocal);
        if (validacionUrl && validacionUrl.Validado == true) {
            const id_solicitud = validacionUrl.Id_Solicitud;
            this.logger.log(`incodeRecidenceProcess::token validado con exito::Solicitud asociada al token: ${id_solicitud} `)
            this.logger.log(`incodeRecidenceProcess::Solicitud asociada al token: ${id_solicitud} `)
            //TODO::GUARDAR RESPUESTA EN COLECCION
            //DTO PARA LA COMUNICACION
            const incodeDto: ProcessIncodeDto = {
                token: dto.token,
                id_Solicitud: id_solicitud,
                fechaLocal: dto.fechaLocal,
                flujo: dto.flujo,
                id_Sesion_Digital: dto.interviewId,
                usuario: validacionUrl.Usuario_Solicitud
            }
            //MANDAMOS A EJECUTAR LOS PROCESOS DE INCODE ASINCRONICAMENTE
            this.sendIncodeProcess(EXECUTE_ALL_EVENTS, incodeDto)

            this.updateStatus(id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'BIOMETRIC_RECIDENCE')
            this.actionLog(AcctionType.VALIDACION_BIOMETRICA_DOMICILIO,
                id_solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'Validacion documento Domicilio');
        } else {
            this.logger.error(`incodeRecidenceProcess::Error | ${validacionUrl.Id_Solicitud} | TOKEN URL NO VALIDADO: ${validacionUrl.Mensaje}`)
            this.updateStatus(validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'ERR')
            this.actionLog(AcctionType.ERROR_FLUJO_DOMICILIO,
                validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, validacionUrl.Mensaje ?? "Error al validar el token");
            throw Error(validacionUrl.Mensaje ?? "Error al validar el token")
        }
    }
}
