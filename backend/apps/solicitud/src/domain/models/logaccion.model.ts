/* eslint-disable prettier/prettier */
export interface LogAccionSolicitudModel {
  ID: number;
  FK_MTR_SOLICITUD: number;
  ACCION: string | null;
  DESCRIPCION: string | null;
  FECHA_ACCION: string;
  USUARIO: string | null;
  FLAG: string | null;
}
