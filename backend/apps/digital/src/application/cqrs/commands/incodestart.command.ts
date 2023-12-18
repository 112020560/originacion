/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IStartSessionService } from 'apps/digital/src/domain/interfaces';
import { IncodeSesionModel } from 'apps/digital/src/domain/models/incodesession.model';
import { StartDigitalFlowDto } from '../../dtos';
export class IncodeStartSesionCommand implements ICommand {
    constructor(public readonly dto: StartDigitalFlowDto) { }
}

@CommandHandler(IncodeStartSesionCommand)
export class IncodeStartSesionHandler implements ICommandHandler<IncodeStartSesionCommand, GenericCustomResponse<IncodeSesionModel>>{
    constructor(
        @Inject('IStartSessionService')
        private readonly digitalService: IStartSessionService,
    ) { }
    async execute(command: IncodeStartSesionCommand): Promise<GenericCustomResponse<IncodeSesionModel>> {
        const sessionData = await this.digitalService.startSession(command.dto);
        return {
            Success: true,
            Data: {
                interviewId: sessionData.interviewId,
                token: sessionData.token
            },
            Message: 'success'
          }
    }
}