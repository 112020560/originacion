/* eslint-disable prettier/prettier */
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";

export interface IIncodeFilesService {
    getIncodeFiles(dto: ProcessIncodeDto): Promise<boolean>;
}