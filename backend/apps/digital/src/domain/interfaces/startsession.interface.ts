/* eslint-disable prettier/prettier */
import { IncodeStartSessionResponse } from "@app/infrastructure/api/incode/models/startsession.model";
import { StartDigitalFlowDto } from "../../application/dtos/startdigitalflow.dto";


export interface IStartSessionService {
    startSession(dto: StartDigitalFlowDto): Promise<IncodeStartSessionResponse> ;
}