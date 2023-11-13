/* eslint-disable prettier/prettier */


export interface DocumentToSign {
    Id_solicitud: number;
    Id_impresion: number | null;
    Token: string | null;
    Usuario: string | null;
    Fecha: Date;
    Cuenta: string | null;
    Banco: string | null;
    UrlFirma: string | null;
    EnviaCampa: boolean;
}