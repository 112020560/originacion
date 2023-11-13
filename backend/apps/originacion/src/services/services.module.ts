/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/modules
*/

import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { Module } from '@nestjs/common';
import { DocumentoSolicitudService } from './documents.service';
import { EventLogService } from './eventlog.service';
import { SolicitudService } from './solicitud.service';


@Module({
  imports: [F2pGlobalModule, MongoDbModule],
  controllers: [],
  providers: [EventLogService, DocumentoSolicitudService,
  {
    provide:'SolicitudInterfaceRepository',
    useClass: SolicitudService
  }],
  exports:[EventLogService, DocumentoSolicitudService,
    {
      provide:'SolicitudInterfaceRepository',
      useClass: SolicitudService
    }]
})
export class ServicesModule {}
