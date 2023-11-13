/* eslint-disable prettier/prettier */
import { commonIncodeDto } from "../../application/dtos";

export interface IProcessRecidenceService {
    incodeRecidenceProcess(dto: commonIncodeDto): Promise<void>;
}