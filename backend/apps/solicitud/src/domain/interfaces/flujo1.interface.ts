/* eslint-disable prettier/prettier */
import { FlujosIngresoDto } from "../../application/dtos/flujos.dto";
import { BlazeRespModel } from "../models/blazeresponse.model";


export interface IOneFlowUseCase {
    execute(solicitudKyCModel: FlujosIngresoDto): Promise<BlazeRespModel>;
}