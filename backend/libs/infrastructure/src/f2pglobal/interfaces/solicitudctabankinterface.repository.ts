/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { TraSolicitudCuentaBanco } from '../entities/TraSolicitudCuentaBanco';
import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';
export interface ISolicitudCuentaRepository extends BaseInterfaceRepository<TraSolicitudCuentaBanco> {}
