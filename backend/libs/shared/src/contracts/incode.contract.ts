/* eslint-disable prettier/prettier */
export class ProcessIncodeDto {
    id_Solicitud: number;
    flujo?: string | null;
    id_Sesion_Digital?: string | null;
    fechaLocal?: Date;
    informacion?: any | null;
    usuario?: string | null;
    token?: string | null;
    apiKey?: string | null;
}