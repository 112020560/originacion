/* eslint-disable prettier/prettier */
import { commonIncodeDto } from "../../application/dtos/incode.dto";

export interface IProcessIdService {
    processDocumentId(dto: commonIncodeDto): Promise<boolean>;
}