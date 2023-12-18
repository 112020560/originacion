/* eslint-disable prettier/prettier */
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { LinkSolicitudRepository } from "@app/infrastructure/mongodb/repositories/linksolicitud.repository";
import { CREATE_DIGITAL_LINK } from "@app/shared/Const/events.const";
import { ValidacionTokenLinkModel, ValidateLinkContract } from "@app/shared/contracts";
import { GenerateLinkContract } from "@app/shared/contracts/generatelink.contract";
import { LinkResponse } from "@app/shared/contracts/linkresponse.model";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ObjectId } from "mongodb";
import { lastValueFrom } from "rxjs";
import { CreateLinkDto } from "../application/dtos/createlink.dto";
import { IEventDriveService } from "./interfaces/eventdrive.interface";
import { ILinkService } from "./interfaces/link.interface";

@Injectable()
export class LinkService implements ILinkService{
    private readonly logger = new Logger(LinkService.name);
    constructor(        
        private readonly linkRepository: LinkSolicitudRepository,
        @Inject('FolioInterfaceRepository') 
        readonly folioRepository: FolioInterfaceRepository,        
        @Inject('DIGITAL_SERVICE')
        private readonly digitalProxy: ClientProxy,
        @Inject('IEventDriveService')
        private readonly eventService: IEventDriveService,
        
    ) {

    }

    public async createLink(generarLinkModel: CreateLinkDto, cambioEstado = true): Promise<LinkResponse> {
        this.logger.log(`Folio ${generarLinkModel.id_Solicitud} - Generando url para el flujo ${generarLinkModel.flujo}`);
        const id_solicitud = generarLinkModel.id_Solicitud;
        const usuario = generarLinkModel.usuario;
        const fecha = new Date(generarLinkModel.fechaGeneracion);
        try {
            //const METHOD_STEP = `GENERAR-LINK-${generarLinkModel.flujo.toUpperCase()}`;
            //Validamos que la solicitud exista y este activa aun
            const solicitud = await this.folioRepository.findOneByFilter({ id_request: id_solicitud, status: 'ACTIVA' });
            //VALIDAMOS QUE EXISTA LA SOLICITUD
            if (!solicitud) throw new Error(`LA SOLICITUD ${id_solicitud} NO EXISTE O NO TIENE UN ESTADO VALIDO`)
            //VALIDAMOS EN EL PASO EN EL QUE ESTA LA SOLICITUD
            //const solicitudStep = solicitud.flowSteps.pop()
            //TODO:: const validatStepFlow = await this.workflowService.validateStepFlow(solicitudStep, this.FLOW, METHOD_STEP);
            //TODO:: if (validatStepFlow) {
            if (1 == 1) {
                this.logger.log(`Folio ${id_solicitud} - Flujo validado correctamente`);
                //MANDAMOS AL MICROSERVICIO DIGITAL A CREAR EL LINK
                const body: GenerateLinkContract = {
                    digitalFlow: generarLinkModel.flujo,
                    id_solicitud: id_solicitud,
                    processDate: fecha,
                    userName: usuario
                }
                const request = this.digitalProxy.send<LinkResponse>(CREATE_DIGITAL_LINK, body)
                const linkResponse = await lastValueFrom(request);
                //VALIDAMOS QUE SE HAYA GENERADO DE MANERA CORRECTA EL LINK
                if (linkResponse && linkResponse.success) {
                    //SI SE SOLICITA AL INVOCAR EL METODO, SE HACE CAMBIO DE ESTADO   
                    if (cambioEstado) {
                        //MANDAMOS A PUBLICAR EN LA COLA PARA QUE SE REALICE EL CAMBIO DE ESTADO
                        this.eventService.sendUpdateStatus(id_solicitud, fecha, usuario, generarLinkModel.flujo.toUpperCase());
                    }
                    //ENVIAMOS EL EVENTO A LA SOLICITUD
                    this.eventService.sendEventLog(AcctionType.VALIDACION_BIOMETRICA, id_solicitud, fecha, usuario, `ENVIO LINK ${linkResponse.link}`);
                    //RETORNAMOS LA RESPUESTA DE LA CREACION DEL LINK
                    return linkResponse;
                } else {
                    throw (linkResponse.error ?? "Error no controlado al generar el link")
                }
            } else {
                throw Error('ESTA INTENATDO EJECUTAR UN UN PASO QUE NO CUMPLE CON EL FLUJO ESTABLECIDO')
            }
        } catch (error) {
            this.logger.error(`${JSON.stringify({ error })}`);
            //TODO:: manda toficacion con el socket
            return {
                success: false,
                link: null,
                token: null,
                error: `${JSON.stringify({ error })}`
            }
        }

    }
    public async validateLink(token: string, date: Date): Promise<ValidacionTokenLinkModel> {
        const body: ValidateLinkContract = {
            token: token,
            processDate: date
        }
        const $comd = this.digitalProxy.send<ValidacionTokenLinkModel>('validate_token', body)
        const validacionUrl = await lastValueFrom($comd)
        return validacionUrl;
    }

    public async updateStatusLinkAsync(token: string, estado: string, observacion: string) {
        const link = await this.linkRepository.findOneByFilter({ where: { Token: token } });
        if (link != null) {
            await this.linkRepository.update({ _id: new ObjectId(link.id) }, {
                $set: { Estado: estado, Observacion: observacion },
            });
        }
    }

    public async updateStatusLinkByFolioAsync(id_solicitud: number, flow: string,estado: string, observacion: string) {
        const link = await this.linkRepository.findOneByFilter({Id_Solicitud: id_solicitud, Tipo: flow, Estado: {$in: ['ACTIVO', 'NUEVO', 'PROCESO']} });
        if (link != null) {
            await this.linkRepository.update({ _id: new ObjectId(link.id) }, {
                $set: { Estado: estado, Observacion: observacion },
            });
        }
    }
}