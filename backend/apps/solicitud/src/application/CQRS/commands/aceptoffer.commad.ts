/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IAcceptOfferUseCases } from 'apps/solicitud/src/domain/interfaces/aceptoffer.interface';
import { SalesConfirmModel } from '../../../domain/models/salesconfirm.model';
import { CreateSaleDto } from '../../dtos/createsales.dto';

export class AceptOfferCommand implements ICommand {
    constructor(public readonly dto: CreateSaleDto) {}
}

@CommandHandler(AceptOfferCommand)
export class AceptOfferHandler implements ICommandHandler<AceptOfferCommand, GenericCustomResponse<SalesConfirmModel>> {
    constructor(
        @Inject('IAcceptOfferUseCases')
        private readonly acceptofferusecases : IAcceptOfferUseCases
    ) {}
    async execute(command: AceptOfferCommand): Promise<GenericCustomResponse<SalesConfirmModel>> {
       const offerResponse = await this.acceptofferusecases.execute(command.dto);
       return {
            Success: true,
            Data: offerResponse,
            Message: 'process success'
       }
    }
}