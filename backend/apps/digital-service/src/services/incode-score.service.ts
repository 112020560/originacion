/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from "@app/infrastructure/api/incode/interfaces/incodeprovider.interface";
import { Digital } from "@app/infrastructure/mongodb/entities/partial-entities/digital.entity";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { LinkSolicitudRepository } from "@app/infrastructure/mongodb/repositories/linksolicitud.repository";
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { Inject, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ObjectId } from "mongodb";
import { ServicesEventExtension } from "./abstract/services.abstract";
import { ConfigService } from '@nestjs/config';
import { IIncodeScoreService } from "../domain/interfaces/incodescore.interface";

export class IncodeScoreService extends ServicesEventExtension implements IIncodeScoreService {
    private readonly logger = new Logger(IncodeScoreService.name);
    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        //ESTE SE DEBE DE INYECTAR
        private readonly linkRepository: LinkSolicitudRepository,
        @Inject('CORE_SERVICE')
        readonly clientProxyRMQ: ClientProxy,
        private readonly configService: ConfigService

    ) {
        super(folioRepository, clientProxyRMQ);
    }

    getIncodeScore = async (dto: ProcessIncodeDto): Promise<boolean> => {
        try {
            const id_solicitud = dto.id_Solicitud;
            this.logger.log(`Solicitud: ${id_solicitud} Descargando informacion Score`)

            const incodeScoreResponse = await this.IncodeProvider.getScoreAsync(
                {
                    oauthPayload: {
                        countryCode: "ALL",
                        interviewId: dto.id_Sesion_Digital
                    },
                    payload: {
                        Id_Sesion: dto.id_Sesion_Digital,
                    }
                });
            if (incodeScoreResponse) {
                //OBTENEMOS EL FOLIO
                const folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
                //ASOCIAMOS AL FOLIO LA RESPUESTA DEL PROVEEDOR
                const digital: Digital[] = [
                    {
                        fechaFlujo: new Date(dto.fechaLocal).toISOString(),
                        flujo: dto.flujo,
                        Tipo: 'SCORE',
                        unixFechaLocal: Math.floor(new Date(dto.fechaLocal).getTime() / 1000),
                        InformacionFlujo: JSON.stringify(incodeScoreResponse)
                    }
                ];
                //ACTUALIZAMOS EL FOLIO CON LA RESPUESTA DE INCODE
                this.logger.log(`Solicitud: ${id_solicitud} Se actualiza el folio con la respuesta del proveedor`)
                await this.folioRepository.update({
                    _id: new ObjectId(folio.id)
                }, {
                    $set: {
                        flujoDigital: folio.flujoDigital ? folio.flujoDigital.concat(digital) : digital,
                        updateDate: dto.fechaLocal,
                        userUpdate: dto.usuario
                    }
                })

                //Enviamos el log de eventos
                this.sendEventLog(AcctionType.SCORE_INCODE, id_solicitud, dto.fechaLocal, dto.usuario, `DESCARGA DE SCORE DESDE INCODE: SCORE = ${incodeScoreResponse.overall.value}`)
                //TODO:: SOCKET AL FRONT
                if (dto.flujo && (dto.flujo == "biometric" || dto.flujo == "recidence")) {
                    const score = this.configService.get<number>('INCODE_LIMIT_SCORE');
                    this.logger.log(`Solicitud: ${id_solicitud} - Score configurado como limite: ${score}`);
                    const incodeScore = Number(incodeScoreResponse.overall.value)
                    this.logger.log(`Solicitud: ${id_solicitud} - Score Incode: ${incodeScore}`);
                    //VALIDAMOS QUE EL SCORE DE INCODE SEA MAYOR AL LIMITE PERMITIDO
                    if (incodeScore < score) {
                        this.logger.error(`Solicitud: ${id_solicitud} - Score : ${incodeScore} Rechazado`);
                        //ACTUALIZAMOS EL ESTADO DEL LINK
                        await this.linkRepository.update(
                            {
                                Id_Solicitud: id_solicitud,
                                Tipo: dto.flujo,
                                Estado: { $in: ['ACTIVO', 'NUEVO'] }
                            }, {
                            $set: {
                                Estado: 'INCODE-SCORE',
                            }
                        });
                        //ENVIAMOS EL LOG DE EVENTOS
                        this.sendEventLog(AcctionType.ERROR_VALIDACION_SCORE_INCODE,
                            id_solicitud, dto.fechaLocal, dto.usuario, `El puntaje del proceso de validacion de identidad [ ${incodeScoreResponse.overall.value} ] esta por debajo del permitido`)
                        //CAMBIAMOS EL ESTADO
                        this.sendUpdateStatus(id_solicitud, dto.fechaLocal, dto.usuario, 'ERR_SCORE')
                    } else {
                        this.logger.log(`Solicitud: ${id_solicitud} - Score: ${incodeScore} Aprobado`);
                    }
                }
                this.sendEventLog(AcctionType.DESCARGA_SCORE_INCODE,
                    id_solicitud, dto.fechaLocal, dto.usuario, `DESCARGA FINALIZADA PARA EL FLUJO ${dto.flujo}`);
                return true;
            } else {
                this.logger.error(`Solicitud: ${id_solicitud} - No se obtuvo resultado de la consulta del Score`)
                //ENVIAMOS LOGS DE EVENTOS
                this.sendEventLog(AcctionType.ERROR_VALIDACION_SCORE_INCODE,
                    id_solicitud, dto.fechaLocal, dto.usuario, `No se obtuvo resultado de la consulta del Score`)
                //CAMBIAMOS EL ESTADO
                this.sendUpdateStatus(id_solicitud, dto.fechaLocal, dto.usuario, 'ERR_SCORE')
                return false;
            }
        } catch (error) {
            this.logger.error(`Error en el proceso de descarga del SCORE para la solicitud ${dto.id_Solicitud}: ${JSON.stringify({error})}`);
            return false
        }
    }
}