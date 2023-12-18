/* eslint-disable prettier/prettier */
import { FlujosIngresoDto } from "../../application/dtos/flujos.dto";
import { OfertaCrediticiaModel } from "../models/creditoffer.model";

export interface ITwoFlowUseCase {
    execute(solicitudKyCModel: FlujosIngresoDto): Promise<OfertaCrediticiaModel>
}