/* eslint-disable prettier/prettier */
import { LinkResponse } from "@app/shared/contracts/linkresponse.model";
import { CreateLinkDto } from "../../application/dtos/createlink.dto";

export interface ICreateBiometricLinkUseCases {
    execute(generarLinkModel: CreateLinkDto, cambioEstado: boolean): Promise<LinkResponse>;
}