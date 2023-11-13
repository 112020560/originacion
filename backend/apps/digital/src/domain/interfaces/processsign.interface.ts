/* eslint-disable prettier/prettier */
import { commonIncodeDto } from "../../application/dtos";

export interface IProcessSignService {
    processSing(dto: commonIncodeDto): Promise<void>
}