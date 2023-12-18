/* eslint-disable prettier/prettier */
import { GenericDto } from './generic.dto';
import { Informacion } from '../../domain/models/kyc.model';

export class FlujosIngresoDto extends GenericDto {
  informacion: Informacion;
  otpInformation?: OtpVerificationDto

}

export class OtpVerificationDto {
  external_validate: boolean;
  otp_code: string;
  validated: boolean;
}
