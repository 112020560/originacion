/* eslint-disable prettier/prettier */
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { OfertaCrediticiaModel } from 'apps/solicitud/src/domain/models/creditoffer.model';
import { FlujosIngresoDto } from '../../dtos/flujos.dto';
import { Inject } from '@nestjs/common';
import { ITwoFlowUseCase } from '../../../domain/interfaces/flow2.interface'
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
export class TwoFlowCommand implements ICommand {
    constructor(public readonly payload: FlujosIngresoDto) {}
}

@CommandHandler(TwoFlowCommand)
export class TwoFlowHandler implements ICommandHandler<TwoFlowCommand, GenericCustomResponse<OfertaCrediticiaModel>>{

    constructor(
        @Inject('ITwoFlowUseCase')
        private readonly repository: ITwoFlowUseCase){}
    async execute(command: TwoFlowCommand): Promise<GenericCustomResponse<OfertaCrediticiaModel>> {
        const flow2Response = await this.repository.execute(command.payload);
        return {
            Success: true,
            Message:'success',
            Data: flow2Response
        }
    }

}