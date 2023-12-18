/* eslint-disable prettier/prettier */
import { Inject, Logger } from "@nestjs/common";
import { CreateSaleDto } from "../../application/dtos/createsales.dto";
import { SalesConfirmModel } from "../models/salesconfirm.model";
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface'
import { ObjectId } from 'mongodb';
import { IAcceptOfferUseCases } from "../interfaces/aceptoffer.interface";
import { LinkResponse } from "@app/shared/contracts/linkresponse.model";
import { ILinkService } from "../../services/interfaces/link.interface";
import { INotificationServices } from "../../services/interfaces/notification.interface";

export class AcceptOfferUseCases implements IAcceptOfferUseCases{
    private readonly logger = new Logger(AcceptOfferUseCases.name);
    constructor(
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject('ILinkService')
        private readonly linkService: ILinkService,
        @Inject('INotificationServices')
        private readonly notificationServices: INotificationServices
    ) { }

    public async execute(dto: CreateSaleDto): Promise<SalesConfirmModel> {
        const id_solicitud = dto.Id_Solicitud;
        this.logger.log(`AceptaOferta para la solicitud ${id_solicitud}`);
        const folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
        if (folio) {
            //REGISTRAMOS LA OFERTA EN EL FOLIO EN MONGODB
            await this.folioRepository.update({ _id: new ObjectId(folio.id) },
                {
                    $set: {
                        offer: [
                            {
                                Producto: Number(dto.ID_PRODUCTO),
                                Plazo: dto.PK_PSE_CAT_PROMOCION_PLAZO,
                                Cuota: dto.CUOTA,
                                Ciclo: Number(dto.CICLO),
                                Promocion_Plazo: dto.PK_PSE_CAT_PROMOCION_PLAZO,
                                Activa: true,
                                Monto_venta: dto.MONTO_VENTA,
                                Limite_Credito: dto.LIMITE_CREDITO,
                                FechaOferta: dto.FechaLocal,
                                FechaInactiva: null,
                                Usuario: dto.Usuario,
                                UsuarioInactiva: null,
                                Tasa_Interes: dto.TASA_INTERES_NORMAL
                            }
                        ]
                    }
                })

            const createLinkResponse: LinkResponse = await this.linkService.createLink({
                                                    id_Solicitud: Number(id_solicitud),
                                                    enviar: false,
                                                    fechaGeneracion: dto.FechaLocal,
                                                    flujo: 'biometric',
                                                    usuario: dto.Usuario,
                                    
                                                }, true);
            if(!createLinkResponse.success) {
                return {
                    Mensaje: `Procesado Correctamente! Sin embargo no fue posible generar el link BIOMETRICO: ${createLinkResponse.error}`
                }
            } else {
                this.logger.log(`${id_solicitud} - Link ${createLinkResponse.link} Token-Page ${createLinkResponse.token}`);
                //SE ENVIA LA NOTIFICACION CON EL LINK
                await this.notificationServices.sendUrlNotification('biometric', createLinkResponse.link, folio);
                return {
                    Mensaje: 'Procesado Correctamente!'
                }
            }
        } else {
            throw Error(`No se encontro el folio ${id_solicitud}`)
        }
    }
}
