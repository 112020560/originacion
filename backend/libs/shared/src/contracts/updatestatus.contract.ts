/* eslint-disable prettier/prettier */
export class UpdateStatusContract {
    id_solicitud: number;
    usuario: string;
    fecha: Date;
    statusKey?: string;
    substatusKey?: string;
    interviewid?: string;
}