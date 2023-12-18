/* eslint-disable prettier/prettier */
import { CustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UploadDocumentDto } from 'apps/solicitud/src/application/dtos/uploadfile.dto';
import { IExternalFilesUseCases } from 'apps/solicitud/src/domain/interfaces/externalfile.interface';
export class UploadExternalFileCommand implements ICommand {
    constructor(public readonly dto:UploadDocumentDto){}
}

@CommandHandler(UploadExternalFileCommand)
export class UploadExternalFileHandler implements ICommandHandler<UploadExternalFileCommand, CustomResponse> {
    constructor(@Inject('IExternalFilesUseCases') private readonly externalService: IExternalFilesUseCases) {}
    async execute(command: UploadExternalFileCommand): Promise<CustomResponse> {
        await this.externalService.execute(command.dto);

        return {
            Success: true,
            Message:'upload file success'
        }
    }
}