/* eslint-disable prettier/prettier */
export interface IssuancesCoreResponse {
  IDCOLA_REV_OUT: number | null;
}

export interface IssuancesMessageResponse {
  CODIGO_RESPUESTA: string;
  MENSAJE: string;
}

export interface IngresaVentaResponse {
  outvalues: IssuancesCoreResponse;
  resulset: IssuancesMessageResponse[];
}
