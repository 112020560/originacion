/* eslint-disable prettier/prettier */
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";

export interface IAllIncodeProcess {
    incodeProcess(dto: ProcessIncodeDto): Promise<void>;
}