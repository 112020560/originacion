/* eslint-disable prettier/prettier */
export interface TRANSACTIONRESPONSE {
    RESPONSE_CODE?: string | null;
    RESPONSE_DESC?: string | null;
    DATETIME_TRANSACTION?: string | null;
    USUARIO_CONSULTA?: string | null;
    BIN_ID_SOLICITUD_REF?: string | null;
    MARCA?: string | null;
}

export interface MENSAJE {
    CODIGO?: string | null;
    FEC_CREACION?: string | null;
    STR_IDENTIFICACION?: string | null;
    TIPO?: string | null;
    MENSAJE_CREDITO?: string | null;
    MENSAJE_VENTAS?: string | null;
}

export interface MENSAJESBLAZE {
    MENSAJE?: any | null;
}

export interface OTROSDATOSFLAG {
    CAMBIO_PRODUCTO?: string | null;
    PANTALLA_OFER_CREDIT?: string | null;
    CODIGO_MENSAJE?: string | null;
    SOLICITUD_ACTIVA_SUCURSAL_VIRTUAL?: string | null;
    CODIGO_SOLICITUD_ACTIVA_SUCURSAL_VIRTUAL?: string | null;
    BIT_PERFIL_ASALARIADO?: string | null;
    BIT_TOKEN_BANCARIO?: string | null;
    STR_CODIGO_BASE?: string | null;
}

export interface F2PFILE {
    TRANSACTION_RESPONSE?: TRANSACTIONRESPONSE | null;
    MENSAJES_BLAZE?: MENSAJESBLAZE | null;
    OTROS_DATOS_FLAG?: OTROSDATOSFLAG | null;
}

export interface TrasladeResponse {
    F2P_FILE?: F2PFILE | null;
}