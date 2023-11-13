/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import { MtrSolicitudDocumento } from '@app/infrastructure/f2pglobal/entities/MtrSolicitudDocumento';
import { SOLICITUD_DOCUMENTO, UPDATE_INFORMATION, UPDATE_STATUS } from '@app/shared/Const/events.const';
import { UpdateContract } from '@app/shared/contracts/update.contract';
import { UpdateStatusContract } from '@app/shared/contracts/updatestatus.contract';
import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SolicitudInterfaceRepository } from '../domain/interfaces/solicitud.interface';
import { DocumentoSolicitudService } from '../services/documents.service';

@Controller()
export class SolicitudController {

    constructor(
        private readonly documentoDolicitudRepository: DocumentoSolicitudService,
        @Inject('SolicitudInterfaceRepository') private readonly solicitudRepository: SolicitudInterfaceRepository
        ){}

    @EventPattern(SOLICITUD_DOCUMENTO)
    async handleMessagePrinted(@Payload() data: MtrSolicitudDocumento) {
        Logger.log(SOLICITUD_DOCUMENTO, data);
        await this.documentoDolicitudRepository.insertDocumentoSolicitud(data);
    }

    @EventPattern(UPDATE_STATUS)
    async updateStatusSolicitud(@Payload() data: UpdateStatusContract) {
        Logger.log(UPDATE_STATUS,data);
        await this.solicitudRepository.updateStatus(data);
    }

    @EventPattern(UPDATE_INFORMATION)
    async updateSolicitud(@Payload() data: UpdateContract) {
        Logger.log(UPDATE_INFORMATION,`Payload = ${data}`);
        //Logger.log(`context = ${context}`);
        await this.solicitudRepository.updateInformation(data);
    }
}
