/* eslint-disable prettier/prettier */
export interface Escenarios {
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

export interface OfertaCrediticiaModel {
    Aprobado: boolean;
    Mensaje: string | null;
    Escenarios: Escenarios[] | null;
}