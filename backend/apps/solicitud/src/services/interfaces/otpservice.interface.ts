/* eslint-disable prettier/prettier */
import { OtpGenerateDto } from "../../application/dtos/otpgenerate.dto";
import { ValidateOtp } from "../../domain/models/validateotp.model";

export interface OtpInterfaceService {
    otpValidate(dto: OtpGenerateDto): Promise<ValidateOtp>
    otpGenerate(dto: OtpGenerateDto): Promise<string>;
}