/* eslint-disable prettier/prettier */
export class CreateLinkDto {
    id_Solicitud: number;
    flujo?: string | null;
    fechaGeneracion?: Date;
    usuario?: string | null;
    enviar?: boolean;
  }