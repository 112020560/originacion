/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Controller, Get, Param, Post, Body, Put, Delete, Version, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { AceptOfferCommand } from '../application/CQRS/commands/aceptoffer.commad';
import { OneFlowCommand } from '../application/CQRS/commands/oneflow.command';
import { TwoFlowCommand } from '../application/CQRS/commands/twoflow.command';
import { CreateSaleDto } from '../application/dtos/createsales.dto';
import { FlujosIngresoDto } from '../application/dtos/flujos.dto';
import { BlazeRespModel } from '../domain/models/blazeresponse.model';
import { OfertaCrediticiaModel } from '../domain/models/creditoffer.model';
import { SalesConfirmModel } from '../domain/models/salesconfirm.model';

@ApiTags('SolicitudInformacion')
@Controller('SolicitudInformacion')
export class SolicitudInformacionController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) { }


    @Version('1')
    @HttpCode(200)
    @Post('flujo1')
    async executeOneFlow(@Body() dto: FlujosIngresoDto): Promise<GenericCustomResponse<BlazeRespModel>> {
        return await this.commandBus.execute<OneFlowCommand, GenericCustomResponse<BlazeRespModel>>(new OneFlowCommand(dto));
    }

    @Version('1')
    @HttpCode(200)
    @Post('flujo2')
    async executeTwoFlow(@Body() dto: FlujosIngresoDto): Promise<GenericCustomResponse<OfertaCrediticiaModel>> {
        return await this.commandBus.execute<TwoFlowCommand, GenericCustomResponse<OfertaCrediticiaModel>>(new TwoFlowCommand(dto));
    }

    @Version('1')
    @HttpCode(200)
    @Post('AceptaOferta')
    async aceptOffer(@Body() dto: CreateSaleDto): Promise<GenericCustomResponse<SalesConfirmModel>> {
        return await this.commandBus.execute<AceptOfferCommand, GenericCustomResponse<SalesConfirmModel>>(new AceptOfferCommand(dto));
    }
}
