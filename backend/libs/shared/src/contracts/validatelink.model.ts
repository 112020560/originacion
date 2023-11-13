/* eslint-disable prettier/prettier */
export interface ValidacionTokenLinkModel {
  Id_Solicitud?: number;
  Usuario_Solicitud?: string | null;
  Mensaje?: string | null;
  Validado?: boolean;
  CurrentStatus?: string;
  Existe: boolean;
}
