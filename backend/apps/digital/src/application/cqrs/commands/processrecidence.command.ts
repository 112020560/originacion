/* eslint-disable prettier/prettier */
import { CustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IProcessRecidenceService } from 'apps/digital/src/domain/interfaces/processrecidence.interface';
import { commonIncodeDto } from '../../dtos';
export class ProcessRecidenceCommand implements ICommand {
    constructor(public readonly dto: commonIncodeDto) { }
}

@CommandHandler(ProcessRecidenceCommand)
export class ProcessRecidenceHandler implements ICommandHandler<ProcessRecidenceCommand, CustomResponse> {
    constructor(
        @Inject('IProcessRecidenceService')
        private readonly processRecidenceService: IProcessRecidenceService,
    ) { }
    async execute(command: ProcessRecidenceCommand): Promise<CustomResponse> {
        await this.processRecidenceService.incodeRecidenceProcess(command.dto)
        return {
            Success: true,
            Data: 'Sucess',
            Message: 'success'
        }
    }
}