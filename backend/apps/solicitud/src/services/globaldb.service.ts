/* eslint-disable prettier/prettier */
import { SolicitudRepository } from "@app/infrastructure/f2pglobal/repositories/solicitud.repository";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { Inject, Injectable } from "@nestjs/common";
import { IGlobalDbService } from "./interfaces/solicitud.Interface";
import { ISolicitudCuentaRepository } from '@app/infrastructure/f2pglobal/interfaces/solicitudctabankinterface.repository'
import { TraSolicitudCuentaBanco } from "@app/infrastructure/f2pglobal/entities/TraSolicitudCuentaBanco";
import { ObjectId } from "mongodb";

@Injectable()
export class GlobalDbService implements IGlobalDbService {
    constructor(

        private readonly solicitudRepository: SolicitudRepository,
        @Inject('FolioInterfaceRepository')
        private readonly folioInterfaceRepository: FolioInterfaceRepository,
        @Inject('ISolicitudCuentaRepository') readonly cuentaBancoRepository: ISolicitudCuentaRepository,
    ) { }

    public async updateData(id_solicitud: number, id_impresion: number, date: Date, username: string): Promise<void> {
        const solicitud = await this.solicitudRepository.findByCondition({ where: { id: id_solicitud } })
        if (solicitud) {
            solicitud.fechaModificacion = date,
                solicitud.usuarioModificacion = username;
            solicitud.identificadorExterno = id_impresion.toString();
            const response = await this.solicitudRepository.save(solicitud);
            if (response.identificadorExterno == id_impresion.toString()) {
                await this.folioInterfaceRepository.update({ id_request: id_solicitud }, {
                    $set: {
                        identificadorExterno: id_impresion.toString(),
                        updateDate: date,
                        userUpdate: username
                    }
                })
            }
        }
    }

    public async addorUpdateAccountBank(action: string, solicitud: number, account: string, bank: string, user: string, date: Date): Promise<void> {
        if (action == 'INSERT') {
            await this.cuentaBancoRepository.save({
                banco: bank,
                cuenta: account,
                fechaCreacion: date,
                fkMtrSolicitud: {
                    id: solicitud,
                },
                llaveRegistroProveedor: 'N/A',
                observacion: 'CUENTA SE VERIFICA EN LA DISPERSION',
                usuario: user,
                validada: false
            });
        }
        if (action == 'UPDATE') {
            const solicitudBanco = await this.cuentaBancoRepository.findByCondition({ where: { fkMtrSolicitud: { id: solicitud } } });
            solicitudBanco.observacion = `old: ${solicitudBanco.cuenta} - new ${account}`
            await this.cuentaBancoRepository.save(solicitudBanco);
        }

        //ACTUALIZAMOS EL REGISTRO EN MONGO PARA MANTENER LA CONSISTENCIA DE LOS DATOS
        await this.folioInterfaceRepository.update({ _id: new ObjectId(solicitud) }, {
            $set: {
                accountBank: account,
                bank: bank
            }
        });
    }
}