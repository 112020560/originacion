/* eslint-disable prettier/prettier */
export class OtpGenerateDto {
    id_Solicitud: number;
    fechaLocal: Date;
    usuario: string | null;
    telefonoCelular: string | null;
    otp: string | null;
    enviar: boolean;
}