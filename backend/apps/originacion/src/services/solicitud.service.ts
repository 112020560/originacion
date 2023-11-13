/* eslint-disable prettier/prettier */
import { CatEstadoInterfaceRepository } from '@app/infrastructure/f2pglobal/interfaces/catestadointerface.repository';
import { CatSubEstadoInterfaceRepository } from '@app/infrastructure/f2pglobal/interfaces/catsubestadointerface.repository';
import { SolicitudRepository } from '@app/infrastructure/f2pglobal/repositories/solicitud.repository';
import { Folio } from '@app/infrastructure/mongodb/entities/folio.entity';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { UpdateContract } from '@app/shared/contracts/update.contract';
import { UpdateStatusContract } from '@app/shared/contracts/updatestatus.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { SolicitudInterfaceRepository } from '../domain/interfaces/solicitud.interface';
import { EventLogService } from './eventlog.service';
import mongoose from 'mongoose';

@Injectable()
export class SolicitudService implements SolicitudInterfaceRepository {
    private readonly logger = new Logger(SolicitudService.name);
    constructor(
        private readonly solicitudService: SolicitudRepository,
        private readonly logAccion: EventLogService,
        @Inject('CatEstadoInterfaceRepository') private readonly estadoRepository: CatEstadoInterfaceRepository,
        @Inject('CatSubEstadoInterfaceRepository') private readonly subestadoRepository: CatSubEstadoInterfaceRepository,
        @Inject('FolioInterfaceRepository') private readonly folioRepository: FolioInterfaceRepository
    ) {
        mongoose.set('debug', true);
    }

    async updateStatus(updatestatusDto: UpdateStatusContract): Promise<void> {
        this.logger.log(`Inicio de actualizacion de substatus a la solicitud ${updatestatusDto.id_solicitud}`)
        try {
            let solicitud = null
            //VALIDAMOS SI HAY QUE BUSCAR POR ID O POR INTERVIEW ID
            if (updatestatusDto.id_solicitud != 0) {
                this.logger.debug(`Actualizando estado por id`);
                solicitud = await this.solicitudService.findOneById(updatestatusDto.id_solicitud);
            } else if (updatestatusDto.interviewid) {
                this.logger.debug(`Actualizando estado por interviewId`);
                solicitud = await this.solicitudService.findByCondition({where: {idSessionProveedor: updatestatusDto.interviewid}})
            } 
            if (solicitud) {
                if (updatestatusDto.substatusKey != '' && updatestatusDto.substatusKey != undefined && updatestatusDto.substatusKey != null) {
                    const subStatusRow = await this.subestadoRepository.findByCondition({ where: { llaveBusqueda: updatestatusDto.substatusKey }, relations: { fkEstado: true } });
                    if (subStatusRow) {
                        this.logger.log(`solicitud ${updatestatusDto.id_solicitud} - Nuevo SubEstado: ${subStatusRow.subEstado}`)
                        console.log(subStatusRow)
                        solicitud.fkEstadoSolicitud = subStatusRow.fkEstado.pkEstadoSolicitud;
                        solicitud.fkSubestadoSolicitud = subStatusRow.pkSubestadoSolicitud;
                        this.logger.log('Voy a actualizar')
                        await this.solicitudService.save(solicitud);
                        this.logger.log('ya actualice')
                        //SE OBTIENE EL ESTADO PARA LOS REGISTROS EN MONGO
                        const statusRow = await this.estadoRepository.findOneById(subStatusRow.fkEstado.pkEstadoSolicitud);
                        //MANDAMOS A ACTUALIZAR EL ESTADO Y SUBESTADO EN EL MONGODB
                        await this.updateStatusFolioMongoDb(updatestatusDto.id_solicitud, statusRow.estado, subStatusRow.subEstado);
                    } else {
                        this.logger.error(`solicitud ${updatestatusDto.id_solicitud} no se puede actualizar ya que la llave ${updatestatusDto.substatusKey} no produjo resultados`);
                    }
                } else {
                    this.logger.error(`solicitud ${updatestatusDto.id_solicitud} no se puede actualizar porque la llave de busqueda no fue proporcionada`)
                }
            } else {
                this.logger.error(`solicitud ${updatestatusDto.id_solicitud} No existe`);
            }
        } catch (error) {
            this.logger.error(`solicitud ${updatestatusDto.id_solicitud} - Error en el proceso de actualizacion de estados: ${JSON.stringify({ error })}`);
        }

    }

    async updateInformation(updateContract: UpdateContract): Promise<void> {
        this.logger.log(`Inicio de actualizacion de informacion a la solicitud ${updateContract.Id_Solicitud}`)
        try {
            const solicitud = await this.solicitudService.findOneById(updateContract.Id_Solicitud);
            let update = false;
            if (solicitud) {
                if (updateContract.external_reference) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el identificadorExterno con ${updateContract.external_reference}`)
                    solicitud.identificadorExterno = updateContract.external_reference;
                    update = true;
                }
                if (updateContract.provider_session_id) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el idSessionProveedor con ${updateContract.provider_session_id}`)
                    solicitud.idSessionProveedor = updateContract.provider_session_id
                    update = true
                }
                if (updateContract.email) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el correo con ${updateContract.email}`)
                    solicitud.correo = updateContract.email;
                    update = true
                }
                if (updateContract.idOne) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el Curp con ${updateContract.idOne}`)
                    solicitud.identificador = updateContract.idOne;
                    update = true
                }
                if (updateContract.idTwo) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el RFC con ${updateContract.idTwo}`)
                    solicitud.numRfc = updateContract.idTwo;
                    update = true
                }
                if (updateContract.phone) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el telefono con ${updateContract.phone}`)
                    solicitud.telefono = updateContract.phone;
                    update = true
                }
                if (updateContract.fullName) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el Nombre con ${updateContract.fullName}`)
                    solicitud.nombre = updateContract.fullName;
                    update = true
                }

                if (updateContract.canalVenta) {
                    this.logger.log(`Solicitud ${updateContract.Id_Solicitud} - se actualiza el Canal Venta con ${updateContract.canalVenta}`)
                    solicitud.canalVenta = updateContract.canalVenta;
                    update = true
                }
                // if (updateContract.subStatusKey) {
                //     await this.updateStatus({
                //         fecha: updateContract.FechaLocal,
                //         id_solicitud: updateContract.Id_Solicitud,
                //         substatusKey: updateContract.subStatusKey,
                //         usuario: updateContract.Usuario
                //     })
                // }
                //.......Todo lo que falta de actualizar
                if (update) {
                    //ACTUALIZAMOS EN LA BASE DE DATOS F2P_GLOBAL
                    await this.solicitudService.save(solicitud);
                    //ACTUALIZAMOS EN EL MONGODB
                    await this.updateInformationMongoDb(updateContract);
                    //CREAMOS EL EVENTO
                    await this.logAccion.createEventLog({
                        AcctionType: AcctionType.ACTUALIZA_INFORMACION,
                        FechaLocal: updateContract.FechaLocal,
                        Id_Solicitud: updateContract.Id_Solicitud,
                        Usuario: updateContract.Usuario,
                        Observacion: 'ACTUALIZA INFORMACION SOLICITUD'
                    })
                }
            } else {
                this.logger.error(`No se encontro la solicitud con el id: ${updateContract.Id_Solicitud}`);
            }
        } catch (error) {
            this.logger.error(`solicitud ${updateContract.Id_Solicitud} - Error en el proceso de actualizacion de datos: ${JSON.stringify({ error })}`);
        }

    }

    private async updateInformationMongoDb(updateContract: UpdateContract): Promise<void> {

        try {
            const folio = await this.folioRepository.findOneByFilter({ id_request: updateContract.Id_Solicitud });
            let set = {}
            let update = false;
            if (folio) {
                if (updateContract.external_reference) {
                    update = true;
                    folio.externalId = updateContract.external_reference
                    set = { externalId: updateContract.external_reference }
                }
                if (updateContract.provider_session_id) {
                    update = true;
                    folio.digitalSesion = updateContract.provider_session_id;
                    set = { digitalSesion: updateContract.provider_session_id }
                }
                if (update) {
                    this.logger.log(`Se actualizan informacion al folio ${folio.id} asociado a la solicitud ${updateContract.Id_Solicitud}`)
                    await this.folioRepository.update({ _id: folio.id }, {
                        $set: set
                    });
                }
            } else {
                this.logger.error(`No se encontro el folio con el id_request: ${updateContract.Id_Solicitud}`);
            }
        } catch (error) {
            this.logger.error(`solicitud ${updateContract.Id_Solicitud} - Error en el proceso de actualizacion de datos en MongoDb: ${JSON.stringify({ error })}`);
        }


    }

    private async updateStatusFolioMongoDb(id_solicitud: number, status: string, substatus: string) {
        try {
            //CONSULTAMOS EL FOLIO 
            const folio: Folio = await this.folioRepository.findOneByFilter({ id_request: id_solicitud });
            if (folio) {
                //ACTUALIZAMOS LOS VALORES
                this.logger.log(`Se actualizan estados ${status} y subestado ${substatus} al folio ${folio.id} asociado a la solicitud ${id_solicitud}`)
                await this.folioRepository.update({ _id: new ObjectId(folio.id) }, {
                    $set: { status: status, subStatus: substatus.trim() }
                })
            } else {
                this.logger.error(`No se encontro el folio con el id_request: ${id_solicitud}`);
            }
        } catch (error) {
            this.logger.error(`solicitud ${id_solicitud} - Error en el proceso de actualizacion de estados en MongoDb: ${JSON.stringify({ error })}`);
        }
    }

}
