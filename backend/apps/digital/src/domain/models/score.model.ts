/* eslint-disable prettier/prettier */
export interface ScoreDigitalRespModel {
    puntajeTotal: string;
    estado: string;
    color: string;
    nombre?: string | null;
    identificacion?: string;
    linkUrl: string | null;
    fechaInscripcion: string;
    scoreResponse?: ScoreResponse[] | null;
}

export interface ScoreResponse {
    key?: string | null;
    value?: string | null;
    color?: string | null;
    estado?: string | null;
}