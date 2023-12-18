/* eslint-disable prettier/prettier */
import { CustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IProcessSignService } from 'apps/digital/src/domain/interfaces';
import { commonIncodeDto } from '../../dtos';
export class ProcessSingCommand implements ICommand {
    constructor(public readonly dto: commonIncodeDto) { }
}

@CommandHandler(ProcessSingCommand)
export class ProcessSingHandler implements ICommandHandler<ProcessSingCommand, CustomResponse>{
    constructor(
        @Inject('IProcessSignService')
        private readonly singService: IProcessSignService
    ) {}
    async execute(command: ProcessSingCommand): Promise<CustomResponse> {
        await this.singService.processSing(command.dto);
        return {
            Success: true,
            Message: 'signature process completed'
        }
    }
}