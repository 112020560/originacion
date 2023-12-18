/* eslint-disable prettier/prettier */
import { ValidacionTokenLinkModel } from "@app/shared/contracts";
import { LinkResponse } from "@app/shared/contracts/linkresponse.model";
import { CreateLinkDto } from "../../application/dtos/createlink.dto";

export interface ILinkService {
    validateLink(token: string, date: Date): Promise<ValidacionTokenLinkModel>;
    updateStatusLinkAsync(token: string, estado: string, observacion: string): Promise<void>;
    updateStatusLinkByFolioAsync(id_solicitud: number, flow: string,estado: string, observacion: string): Promise<void>;
    createLink(generarLinkModel: CreateLinkDto, cambioEstado: boolean): Promise<LinkResponse>;
}