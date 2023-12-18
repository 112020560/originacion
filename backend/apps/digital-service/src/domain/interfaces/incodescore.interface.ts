/* eslint-disable prettier/prettier */
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";

export interface IIncodeScoreService {
    getIncodeScore(dto: ProcessIncodeDto): Promise<boolean>;
}