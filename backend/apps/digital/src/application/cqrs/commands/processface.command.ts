/* eslint-disable prettier/prettier */
import { IncodeProcessFaceResponse } from '@app/infrastructure/api/incode/models/processface.model';
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IProcessFaceServices } from 'apps/digital/src/domain/interfaces';
import { commonIncodeDto } from '../../dtos';
export class ProcessFaceCommand implements ICommand {
    constructor(public readonly  dto: commonIncodeDto){}
}

@CommandHandler(ProcessFaceCommand)
export class ProcessFaceHandler implements ICommandHandler<ProcessFaceCommand, GenericCustomResponse<IncodeProcessFaceResponse>>{
    constructor(
        @Inject('IProcessFaceServices')
        private readonly processFaceService: IProcessFaceServices,
    ){}
    async execute(command: ProcessFaceCommand): Promise<GenericCustomResponse<IncodeProcessFaceResponse>> {
        return {
            Success: true,
            Data: (await this.processFaceService.incodeProcessFace(command.dto)),
            Message: 'success'
          }
    }
}