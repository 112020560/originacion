/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SolicitudController } from './solicitud.controller';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { cqrsQueries } from '../application/CQRS/queries';
import { CqrsModule } from '@nestjs/cqrs';
import { cqrsCommands } from '../application/CQRS/commands';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { SolicitudDocumentoController } from './solicituddocumento.controller';
import { UseCasesModule } from '../domain/usecases/usecases.module';
import { StotageModule } from '@app/infrastructure/storage/storage.module';
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { SolicitudInformacionController } from './solicitudinfo.controller';
import { OtpController } from './otp.controller';
import { ServicesModule } from '../services/services.module';
import { UrlController } from './url.controller';


@Module({
  imports: [CqrsModule, 
    // AutomapperModule.forRoot({
    //   strategyInitializer: classes(),
    // }),
    ServicesModule,
    ClientsModule.register([
      {
        name: 'CORE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:Abc..123@localhost:5672/transactions'],
          queue: 'internal-events',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    UseCasesModule,
    F2pGlobalModule, StotageModule, MongoDbModule],
  controllers: [
    SolicitudController,
    SolicitudDocumentoController,
    SolicitudInformacionController,
    OtpController,
    UrlController],
  providers: [...cqrsQueries, ...cqrsCommands],
  exports: []
})
export class ControllersModule { }
