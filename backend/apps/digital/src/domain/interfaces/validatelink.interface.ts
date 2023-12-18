/* eslint-disable prettier/prettier */
import { ValidateLinkDto } from "../../application/dtos";
import { ValidarTokenModel } from "../models";

export interface IValidateLinkService {
    validateLink(dto: ValidateLinkDto):Promise<ValidarTokenModel>
}