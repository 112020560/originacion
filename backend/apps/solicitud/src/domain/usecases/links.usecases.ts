/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { CreateLinkDto } from '../../application/dtos/createlink.dto';
import { ILinkService } from '../../services/interfaces/link.interface';
import { INotificationServices } from '../../services/interfaces/notification.interface';
import { ICreateBiometricLinkUseCases } from '../interfaces/biometriclink.interface';
import { LinkResponse } from '@app/shared/contracts/linkresponse.model';

// const BASE_URL: string = process.env.BASE_URL_CLIENTE;
// const DAY_EXPIRED = Number(process.env.DAY_EXPIRED_URL);

@Injectable()
export class CreateBiometricLinkUseCases implements ICreateBiometricLinkUseCases  {

    private readonly logger = new Logger(CreateBiometricLinkUseCases.name);

    constructor(
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject('ILinkService')
        private readonly linkService: ILinkService,
        @Inject('INotificationServices')
        private readonly notificationService: INotificationServices
    ) {}

    /**
     *Metodo encargado de crear o generar el nuevo link (biometric/sign)
     *felipe.alpizar
     * @param {CreateLinkDto} generarLinkModel
     * @param {boolean} [cambioEstado=true]
     * @return {*}  {Promise<LinkResponse>}
     * @memberof BiometricLinkUseCases
     */
    public async execute(generarLinkModel: CreateLinkDto, cambioEstado = true): Promise<LinkResponse> {
        this.logger.log(`Folio ${generarLinkModel.id_Solicitud} - Generando url para el flujo ${generarLinkModel.flujo}`);
        const id_solicitud = generarLinkModel.id_Solicitud;
        try {
            //Validamos que la solicitud exista y este activa aun
            const solicitud = await this.folioRepository.findOneByFilter({ id_request: id_solicitud, status: 'ACTIVA' });
            if(solicitud) {
                const linkResponse = await this.linkService.createLink(generarLinkModel, cambioEstado);
                if(linkResponse.success) {
                    await this.notificationService.sendUrlNotification(generarLinkModel.flujo, linkResponse.link, solicitud);
                    return linkResponse;
                } else {
                    throw Error(`Error al generar Link: ${linkResponse.error}`);
                }
            } else {
                throw Error(`La solicitud ${id_solicitud} no existe o no tiene un estado valido para generar el link`)
            }
        } catch(error: any) {
            throw Error(error.message);
        }
    }
}
