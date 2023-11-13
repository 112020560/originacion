/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { OtpInterfaceService } from 'apps/solicitud/src/services/interfaces/otpservice.interface';
import { OtpGenerateDto } from '../../dtos/otpgenerate.dto';
export class GenerateOtpCommand implements ICommand {
    constructor(public readonly dto: OtpGenerateDto){}
}

@CommandHandler(GenerateOtpCommand)
export class GenerateOtpHandler implements ICommandHandler<GenerateOtpCommand, GenericCustomResponse<string>>{
    
    constructor(
        @Inject('OtpInterfaceService')
        private readonly otpServices: OtpInterfaceService){}
    async execute(command: GenerateOtpCommand): Promise<GenericCustomResponse<string>> {
        const otp = await this.otpServices.otpGenerate(command.dto);
        return {
            Success: true,
            Message: 'OTP generado y enviado de manera exitosa',
            Data: otp
        }
    }
}