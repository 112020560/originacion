/* eslint-disable prettier/prettier */

import { TrasladeResponse } from "@app/infrastructure/api/translate/dto/translateresponse.dto";
import { Buro } from "@app/infrastructure/mongodb/entities/partial-entities/buro.entoty";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface"
import { EVENT_LOG, UPDATE_STATUS, UPDATE_INFORMATION } from "@app/shared/Const/events.const";
import { UpdateContract } from "@app/shared/contracts";
import { EventLogContract } from "@app/shared/contracts/eventlog.contract";
import { UpdateStatusContract } from "@app/shared/contracts/updatestatus.contract";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { ClientProxy } from "@nestjs/microservices";
import { ObjectId } from "mongodb";
import { FlujosIngresoDto } from "../../../application/dtos/flujos.dto";
import { F2MENSAJE } from "../../models/f2pmessage";



export abstract class CommonFunctions {
    readonly folioRepository: FolioInterfaceRepository;
    readonly coreproxy: ClientProxy;
    constructor(folioRepository: FolioInterfaceRepository,
        coreproxy: ClientProxy
    ) {
        this.folioRepository = folioRepository;
        this.coreproxy = coreproxy;
    }

    public async GuardarRegistroKyCAsync(solicitudKyCModel: FlujosIngresoDto, buros: Buro[]): Promise<void> {
        //ACTUALIZAMOS REGISTRO MONGO
        const folio = await this.folioRepository.findOneByFilter({ id_request: solicitudKyCModel.id_Solicitud, status: 'ACTIVA' })
        if (folio) {
            const kycupdate = {
                informacionPersonal: solicitudKyCModel.informacion.informacionPersonal,
                informacionAdicional: solicitudKyCModel.informacion.informacionAdicional,
                informacionGeografica: solicitudKyCModel.informacion.informacionGeografica,
                informacionLaboral: solicitudKyCModel.informacion.informacionLaboral,
                informacionPreguntas: solicitudKyCModel.informacion.informacionPreguntas
            }
            

            const updateBuros = folio.buro.concat(buros)

            await this.folioRepository.update({ _id: new ObjectId(folio.id) },
                {
                    $set: {
                        kyc: kycupdate,
                        buro: updateBuros,
                        userUpdate: solicitudKyCModel.usuario,
                        updateDate: solicitudKyCModel.fechaLocal
                    }
                })
        }
    }

    public procesarMensajeRespuestaBlaze(responseT: TrasladeResponse): string {
        if (responseT.F2P_FILE.MENSAJES_BLAZE && responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE) {
            if (Object.prototype.toString.call(responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE) === '[object Array]') {
                const messajeListObject = responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE as F2MENSAJE[]
                if (messajeListObject && messajeListObject.length > 0) {
                    const messageResponse = ''
                    messajeListObject.forEach(element => {
                        messageResponse.concat(element.MENSAJE_VENTAS);
                        messageResponse.concat(' | ')
                    });

                    return messageResponse;
                } else {
                    return "RECHAZO POR REGLAS INTERNAS";
                }
            } else {
                const messageObject = responseT.F2P_FILE.MENSAJES_BLAZE.MENSAJE as F2MENSAJE
                return messageObject?.MENSAJE_VENTAS ?? "RECHAZO NO IDENTIFICADO";
            }
        } else {
            return "RECHAZO POR REGLAS INTERNAS";
        }
    }

    public sendEventLog(accionType: AcctionType, idsolicitud: number, date: Date, user: string, eventDescription: string) {
        const event: EventLogContract = {
            AcctionType: accionType,
            FechaLocal: date,
            Id_Solicitud: idsolicitud,
            Usuario: user,
            Observacion: eventDescription
        }
        this.coreproxy.emit(EVENT_LOG, event);
    }

    public sendUpdateStatus(idsolicitud: number, date: Date, user: string, statusKey: string) {
        const payload: UpdateStatusContract = {
            id_solicitud: idsolicitud,
            fecha: date,
            usuario: user,
            statusKey: '',
            substatusKey: statusKey
        }

        this.coreproxy.emit(UPDATE_STATUS, payload)
    }

    public sendUpdateInformation(idsolicitud: number, date: Date, user: string, extaernalReference: string) {
        const payload: UpdateContract = {
            Id_Solicitud: idsolicitud,
            FechaLocal: date,
            Usuario: user,
            external_reference: extaernalReference,
        }

        this.coreproxy.emit(UPDATE_INFORMATION, payload)
    }
}