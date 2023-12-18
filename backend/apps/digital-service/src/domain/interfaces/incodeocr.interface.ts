/* eslint-disable prettier/prettier */

import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";


export interface IIncodeOcrService {
    getIncodeOcrData(dto: ProcessIncodeDto): Promise<boolean>;
}