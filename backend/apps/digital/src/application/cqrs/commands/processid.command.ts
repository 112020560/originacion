/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IProcessIdService } from 'apps/digital/src/domain/interfaces';
import { commonIncodeDto } from '../../dtos';
export class ProcessIdCommand implements ICommand {
    constructor(public readonly dto: commonIncodeDto) { }
}

@CommandHandler(ProcessIdCommand)
export class ProcessIdHandler implements ICommandHandler<ProcessIdCommand, GenericCustomResponse<boolean>>{
    constructor(
        @Inject('IProcessIdService')
        private readonly processidService: IProcessIdService
    ) { }
    async execute(command: ProcessIdCommand): Promise<GenericCustomResponse<boolean>> {
        const response = await this.processidService.processDocumentId(command.dto)
        return {
            Success: true,
            Data: response,
            Errors: null,
            Message: 'Process DocumentId Success'
        }
    }
}