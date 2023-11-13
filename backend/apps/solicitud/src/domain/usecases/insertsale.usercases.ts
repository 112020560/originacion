/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from '@app/infrastructure/api/incode/interfaces/incodeprovider.interface';
import { Folio } from '@app/infrastructure/mongodb/entities/folio.entity';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { DocumentToSign } from '@app/shared/contracts/sign.contract';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { IngresaVentaModel } from '../models/salescreate.model';
import { SalesConfirmModel } from '../models/salesconfirm.model';
import { IngresaVentaResponse } from '../models/ingresaventaresponse.model';
import { IInsertSaleUseCases } from '../interfaces/sales.interface';
import { ImpresionResponse } from '../models/impresion.model';
import { LinkResponse } from '@app/shared/contracts/linkresponse.model';
import { ICoreService, IEventDriveService, IGlobalDbService, ILinkService } from '../../services/interfaces';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';


@Injectable()
export class InsertSaleUseCases implements IInsertSaleUseCases {

    private readonly logger = new Logger(InsertSaleUseCases.name);

    constructor(
        @Inject('FolioInterfaceRepository')
        private readonly folioRepository: FolioInterfaceRepository,

        @Inject('IncodeProviderInterfaceService')
        private readonly incodeService: IncodeProviderInterfaceService,

        @Inject('IGlobalDbService')
        private readonly solicitudService: IGlobalDbService,

        @Inject('ICoreService')
        private readonly coreService: ICoreService,

        @Inject('IEventDriveService')
        private readonly eventService: IEventDriveService,

        @Inject('ILinkService')
        private readonly linkService: ILinkService,

        private readonly amqpConnection: AmqpConnection
    ) {
    }

    public async createSales(model: IngresaVentaModel): Promise<SalesConfirmModel> {
        const id_solicitud = Number(model.Id_Solicitud);
        const folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
        const date = new Date(model.FechaLocal);
        if (folio) {
            try {
                //INGRESA VENTA
                const ingresaVentaResponse: IngresaVentaResponse = await this.coreService.insertCoreSale(folio, model);
                //APROBACION AUTOMATICA DE VENTA
                const impresiomResponse: Array<ImpresionResponse> = await this.coreService.approveCoreSale(ingresaVentaResponse.outvalues.IDCOLA_REV_OUT, model);
                //VALIDAMOS LA RESPUESTA DE LA APROBACION
                if (impresiomResponse && impresiomResponse.length > 0) {
                    const id_impresion = impresiomResponse[0].ID_IMPRESION;
                    //SE ACTUALIZA EL ID DE IMPRESION EN LAS TABLAS
                    await this.solicitudService.updateData(id_solicitud, id_impresion, date, model.Usuario);
                    //CAMBIO DE ESTADO A "IMPRESION"
                    this.eventService.sendUpdateStatus(id_solicitud, date, model.Usuario, 'IMP')
                    //HAY QUE ACTUALIZAR EL LINK BIOMETRICO ACTUAL
                    await this.linkService.updateStatusLinkByFolioAsync(id_solicitud, 'biometric', 'COMPLETADO', 'Tu proceso digital ya fue completado.');
                    //SE MANDA ACREAR EL LINK DE LA FIRMA
                    this.logger.log(`Id_Solicitud ${id_solicitud} Id_Impresion ${id_impresion} Enviando a generar documentacion`)
                    await this.createSignMessage(folio, id_impresion, model);

                    return {
                        Id_Impresion: id_impresion,
                        Mensaje: 'Procesado Correctamente!'
                    }
                } else {
                    throw ('Error al ingresar venta en impresion');
                }
            } catch (error) {
                throw Error(`createSales error: ${error.message}`);
            }
        } else {
            this.logger.error('[ERR] No se encontro registro de folio');
            throw ('Error al ingresar venta en impresion');
        }
    }





    private async createSignMessage(folio: Folio, idImpresion: number, model: IngresaVentaModel): Promise<void> {
        const interviewId = folio.digitalSesion;
        const payload = {
            countryCode: 'ALL',
            interviewId: interviewId
        }

        const oauthResponse = await this.incodeService.startSessionAsync(payload);
        if (oauthResponse && oauthResponse.token) {

            //MANDAMOS A CREAR EL LINK PARA LA FIRMA
            const urlResponse: LinkResponse = await this.linkService.createLink({
                id_Solicitud: folio.id_request,
                enviar: false,
                fechaGeneracion: model.FechaLocal,
                flujo: 'sign',
                usuario: model.Usuario
            }, false);
            if (urlResponse.success) {
                const documentToSing: DocumentToSign = {
                    Id_impresion: idImpresion,
                    Id_solicitud: folio.id_request,
                    Banco: folio.bank,
                    Cuenta: folio.accountBank,
                    EnviaCampa: true,
                    Fecha: model.FechaLocal,
                    Token: oauthResponse.token,
                    UrlFirma: urlResponse.link,
                    Usuario: model.Usuario
                }

                this.logger.debug(documentToSing);
                this.amqpConnection.publish( "sign.events", "*.events.documents",documentToSing)
            } else {
                this.logger.error(`No fue posible generar el link: ${urlResponse.error}`);
            }
        }
    }

    // private updateImpresionId = async (id_solicitud: number, id_impresion: number, date: Date, username: string): Promise<void> => {
    //     const solicitud = await this.solicitudRepository.findByCondition({ where: { id: id_solicitud } })
    //     if (!solicitud) {
    //         solicitud.fechaModificacion = date,
    //             solicitud.usuarioModificacion = username;
    //         solicitud.identificadorExterno = id_impresion.toString();
    //         const response = await this.solicitudRepository.preload(solicitud);
    //         if (response.identificadorExterno == id_impresion.toString()) {
    //             await this.folioInterfaceRepository.update({ id_request: id_solicitud }, {
    //                 $set: {
    //                     identificadorExterno: id_impresion.toString(),
    //                     updateDate: date,
    //                     userUpdate: username
    //                 }
    //             })
    //         }
    //     }
    // }
}
