/* eslint-disable prettier/prettier */
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ValidateLinkDto } from "../application/dtos/validatelink.dto";
import { IValidateLinkService } from "../domain/interfaces/validatelink.interface";
import { ValidarTokenModel } from "../domain/models";
import { IncodeAbstract } from "./abstract/incode.abstract";

@Injectable()
export class ValidateLinkService extends IncodeAbstract implements IValidateLinkService{
    constructor(
        @Inject('DIGITAL_SERVICE')
        readonly digitalProxy: ClientProxy,
        @Inject('CORE_SERVICE')
        readonly coreProxy: ClientProxy,
        @Inject('FolioInterfaceRepository') 
        readonly folioRepository: FolioInterfaceRepository,
    ){
        super(coreProxy, digitalProxy);
    }


    public validateLink = async (dto: ValidateLinkDto):Promise<ValidarTokenModel> => {

        const validacionUrl = await this.validateTokenUrl(dto.token, dto.localDate);
        if(validacionUrl.Validado) {
            const folio = await this.folioRepository.findOneByFilter({id_request: validacionUrl.Id_Solicitud})
            if(folio) {
                const info = folio.kyc.informacionPersonal;
                const fullname =  `${info.Nombre} ${info.SegundoNombre} ${info.ApellidoPaterno} ${info.ApellidoMaterno}`
                return {
                    Cliente: fullname,
                    InterviewId: folio.digitalSesion,
                    Mensaje: validacionUrl.Mensaje,
                    TokenValido: true,
                    Route: dto.digitalFlow
                }
            } else {
                return {
                    TokenValido: false,
                    Mensaje: `La solicitud asociada al token ${dto.token} no existe"`
                }
            }
        } else {
            return {
                TokenValido: false,
                Mensaje: validacionUrl.Mensaje,
            }
        }
    }
}