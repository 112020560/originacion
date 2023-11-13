/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IOneFlowUseCase } from 'apps/solicitud/src/domain/interfaces/flujo1.interface';
import { BlazeRespModel } from 'apps/solicitud/src/domain/models/blazeresponse.model';
import { FlujosIngresoDto } from '../../dtos/flujos.dto';
export class OneFlowCommand implements ICommand {
    constructor(public readonly dto: FlujosIngresoDto) { }
}


@CommandHandler(OneFlowCommand)
export class OneFlowHandler implements ICommandHandler<OneFlowCommand, GenericCustomResponse<BlazeRespModel>> {
    constructor(
        @Inject('IOneFlowUseCase')
        private readonly oneFlowUseCase: IOneFlowUseCase
    ) { }
    async execute(command: OneFlowCommand): Promise<GenericCustomResponse<BlazeRespModel>> {
        const flow1Response: BlazeRespModel = await this.oneFlowUseCase.execute(command.dto);
        return {
            Success: true,
            Message: 'success',
            Data: flow1Response
        }
    }

}