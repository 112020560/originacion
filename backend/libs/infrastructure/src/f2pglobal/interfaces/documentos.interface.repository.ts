/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { BaseInterfaceRepository } from '../repositories/base/base.interface.repository';
import { MtrSolicitudDocumento } from '../entities/MtrSolicitudDocumento';

export interface ISolicitudDocumentoRepository
  extends BaseInterfaceRepository<MtrSolicitudDocumento> {}
