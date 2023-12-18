/* eslint-disable prettier/prettier */
import { MtrSolicitud } from './MtrSolicitud.entity';
import { CatSubEstadoSolicitud } from './CatSubEstadoSolicitud';
import { CatEstadoSolicitud } from './CatEstadoSolicitud';
import { LogAccionSolicitud } from './LogAccionSolicitud';
import { MtrSolicitudDocumento } from './MtrSolicitudDocumento';
import { TraSolicitudBuro } from './TraSolicitudBuro';
import { TraSolicitudCuentaBanco } from './TraSolicitudCuentaBanco';
import { TraSolicitudDigital } from './TraSolicitudDigital';
import { TraSolicitudKyc } from './TraSolicitudKyc';
import { CatEntidadBancaria } from './CatEntidadBancaria';

export const entities = [
  MtrSolicitud,
  CatSubEstadoSolicitud,
  CatEstadoSolicitud,
  LogAccionSolicitud,
  MtrSolicitudDocumento,
  TraSolicitudBuro,
  TraSolicitudCuentaBanco,
  TraSolicitudDigital,
  TraSolicitudKyc,
  CatEntidadBancaria
];
