/* eslint-disable prettier/prettier */
import { LinkResponse } from '@app/shared/contracts/linkresponse.model';
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ICreateBiometricLinkUseCases } from 'apps/solicitud/src/domain/interfaces/biometriclink.interface';
import { ILinkService } from 'apps/solicitud/src/services/interfaces/link.interface';
import { CreateLinkDto } from '../../dtos/createlink.dto';
export class CreateLinkCommand implements ICommand {
    constructor(public readonly dto: CreateLinkDto) { }
}
@CommandHandler(CreateLinkCommand)
export class CreateLinkCommandHandler implements ICommandHandler<CreateLinkCommand, GenericCustomResponse<LinkResponse>>{
    constructor(
        @Inject('ICreateBiometricLinkUseCases')
        private readonly createLinkUseCases: ICreateBiometricLinkUseCases
    ){}
    async execute(command: CreateLinkCommand): Promise<GenericCustomResponse<LinkResponse>> {
        const linkResponse = await this.createLinkUseCases.execute(command.dto, true);
        return {
            Success: true,
            Data: linkResponse,
            Message: `${command.dto.flujo} url created!!`
        }
    }
}