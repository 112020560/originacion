/* eslint-disable prettier/prettier */


export interface TRANSACTIONRESPONSE {
    RESPONSE_CODE: string | null;
    RESPONSE_DESC: string | null;
    DATETIME_TRANSACTION: string | null;
    USUARIO_CONSULTA: string | null;
    MARCA: string | null;
}

export interface NFORMACIONPERSONAL {
    NUMEROIDENTIFICACION: string | null;
    TIPOIDENTIFICACION: string | null;
    PRIMERNOMBRE: string | null;
    SEGUNDONOMBRE: string | null;
    PRIMERAPELLIDO: string | null;
    SEGUNDOAPELLIDO: string | null;
    FECHANACIMIENTO: string | null;
    EDAD: string | null;
    ESTADOCIVIL: string | null;
    SEXO: string | null;
    DEPENDIENTES: string | null;
    CANTIDADVEHICULOS: string | null;
    PROPIEDADES: string | null;
    NUMIDENTIF: string | null;
    CODCLIENTE: string | null;
    IDCAMPA: string | null;
}

export interface PRODUCTO {
    ID_PRODUCTO: string | null;
    FK_STC_CAT_PRODUCTO: string | null;
    LIMITE_CREDITO: string | null;
    TRACTO: string | null;
    MINIMO_DESEMBOLSO: string | null;
    MAXIMO_DESEMBOLSO: string | null;
    PK_PSE_CAT_PROMOCION: string | null;
    DESCRIPCION_PROMOCION: string | null;
    PK_PSE_CAT_PROMOCION_PLAZO: string | null;
    PLAZO: string | null;
    DESCRIPCION_PROMOCION_PLAZO: string | null;
    DESCRIPCION_PROMOCION_PLAZO_COMPLETA: string | null;
    MONEDA: string | null;
    NOMBRE_MONEDA: string | null;
    ES_PROMOCIONAL: string | null;
    CICLO: string | null;
    TASA_INTERES_NORMAL: string | null;
    STR_TASA_INTERES_NORMAL: string | null;
    CUOTA: string | null;
    CUOTA_AUTORIZA: string | null;
    COMISION_DESEMBOLSO: string | null;
    STR_COMISION_DESEMBOLSO: string | null;
    FECHA_PAGO: string | null;
    BIT_REQUIERE_FORMALIZACION: string | null;
}

export interface ESCENARIOS {
    PRODUCTO: PRODUCTO[] | null;
}

export interface OTROSDATOSFLAG {
    CAMBIO_PRODUCTO: string | null;
    PANTALLA_OFER_CREDIT: string | null;
    CODIGO_MENSAJE: string | null;
    SOLICITUD_ACTIVA_SUCURSAL_VIRTUAL: string | null;
    CODIGO_SOLICITUD_ACTIVA_SUCURSAL_VIRTUAL: string | null;
    BIT_PERFIL_ASALARIADO: string | null;
    BIT_VERIFICAR_INGRESOS: string | null;
    BIT_FORMALIZACION_ELECTRONICA: string | null;
    BIT_TOKEN_BANCARIO: string | null;
    STR_CODIGO_BASE: string | null;
    BIT_EMPLEADO_PUBLICO: string | null;
    BIT_BANCARIO_INGRESADO: string | null;
    STR_SCORE_FICO: string | null;
}

export interface F2PFILE {
    TRANSACTION_RESPONSE: TRANSACTIONRESPONSE;
    INFORMACION_PERSONAL: NFORMACIONPERSONAL;
    ESCENARIOS: ESCENARIOS;
    MENSAJES_BLAZE: MENSAJESBLAZE;
    OTROS_DATOS_FLAG: OTROSDATOSFLAG;
}

export interface MENSAJESBLAZE {
    MENSAJE: any | null;
}

export interface F2MENSAJE {
    CODIGO: any;
    FEC_CREACION: any;
    STR_IDENTIFICACION: any;
    TIPO: any;
    MENSAJE_CREDITO: string;
    MENSAJE_VENTAS: string;
}

export interface RespuestaFlujo2Model {
    F2P_FILE: F2PFILE;
}