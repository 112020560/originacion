/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaselModule } from './database/database.module';
import { entities } from './entities';
import { SolicitudDocumentoRepository } from './repositories/documents.reporistory';
import { LogAccionRepository } from './repositories/logaccion.repository';
import { SolicitudRepository } from './repositories/solicitud.repository';
import { SolicitudCuentaRepository } from './repositories/solicitudcuenta.repository';
import { MtrSolicitud } from './entities/MtrSolicitud.entity';
import { CatStatusRepository } from './repositories/catestado.repository';
import { CatSubStatusRepository } from './repositories/catsubestado.repository';
import { CatEntidadBancariaRepository } from './repositories/catentidadbancaria.repository';
@Module({
  imports: [DatabaselModule, TypeOrmModule.forFeature([MtrSolicitud, ...entities])],
  controllers: [],
  providers: [SolicitudRepository, LogAccionRepository, SolicitudDocumentoRepository,
    {
      provide: 'ISolicitudCuentaRepository',
      useClass: SolicitudCuentaRepository
    }, {
      provide: 'CatEstadoInterfaceRepository',
      useClass: CatStatusRepository
    },
    {
      provide: 'CatSubEstadoInterfaceRepository',
      useClass: CatSubStatusRepository
    },
    {
      provide: 'ISolicitudDocumentoRepository',
      useClass: SolicitudDocumentoRepository
    },
    {
      provide: 'ICatEntidadBancariaRepository',
      useClass: CatEntidadBancariaRepository
    }
  ],
  exports: [SolicitudRepository, LogAccionRepository, SolicitudDocumentoRepository,
    {
      provide: 'ISolicitudCuentaRepository',
      useClass: SolicitudCuentaRepository
    },
    {
      provide: 'CatEstadoInterfaceRepository',
      useClass: CatStatusRepository
    },
    {
      provide: 'CatSubEstadoInterfaceRepository',
      useClass: CatSubStatusRepository
    },
    {
      provide: 'ISolicitudDocumentoRepository',
      useClass: SolicitudDocumentoRepository
    },
    {
      provide: 'ICatEntidadBancariaRepository',
      useClass: CatEntidadBancariaRepository
    }],
})
export class F2pGlobalModule { }
