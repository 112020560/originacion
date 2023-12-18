/* eslint-disable prettier/prettier */
export interface SolicitudModel {
  Id?: number;
  FechaSolicitud?: number;
  Id_Estado?: number;
  Estado?: string | null;
  Id_SubEstado?: number;
  SubEstado?: string | null;
  Curp?: string | null;
  Rfc?: string | null;
  TelefonoPrincipal?: string | null;
  CorreoElectronico?: string | null;
  Propietario?: string | null;
  NombreCompleto?: string | null;
  UltimaModificacion?: string;
  Informacion?: boolean;
  PoseeArchivos?: boolean;
  RespuestaBuro?: boolean;
  Biometrico?: boolean;
  Domicilio?: boolean;
  CuentaClave?: boolean;
  CuentaClaveValidada?: boolean;
  Reenviar?: boolean;
  Supervisor?: string
}
