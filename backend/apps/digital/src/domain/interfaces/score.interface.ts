/* eslint-disable prettier/prettier */
import { ScoreDigitalRespModel } from "../models";

export interface IScoreService {
    
    getScore(id_solicitud: number, forzar: boolean): Promise<ScoreDigitalRespModel>
}