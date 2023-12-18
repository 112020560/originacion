/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prettier/prettier */
// import { SolicitudModel } from '../models/solicitud.model';

import { MtrSolicitud } from "../entities/MtrSolicitud.entity";
import { BaseInterfaceRepository } from "../repositories/base/base.interface.repository";

// export abstract class ISolicitudRepository {
//   abstract findAll(): Promise<SolicitudModel[]>;
// }
export interface SolicitudRepositoryInterface extends BaseInterfaceRepository<MtrSolicitud> {

    GetByStatus(estado: number, subestado: number , pais: number): Promise<MtrSolicitud[]>;

    GetByOwner(estado: number, subestado: number , pais: number, usernam?: string, supervisor?: string ): Promise<MtrSolicitud[]>;
    update(entity: MtrSolicitud): Promise<void>;
}