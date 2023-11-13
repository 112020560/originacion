/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { LogAccionSolicitud } from '../entities/LogAccionSolicitud';
import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';

export interface ISolicitudLogAccionRepository
  extends BaseInterfaceRepository<LogAccionSolicitud> {}
