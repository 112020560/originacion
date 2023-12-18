/* eslint-disable prettier/prettier */
import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { StotageModule } from '@app/infrastructure/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ExternalFilesUseCases } from './esternalfile.usecases';
import { twoFlowUseCase } from './flow2-usecases';
import { OneFlowUseCase } from './flow1-usecases';
import { InsertSaleUseCases } from './insertsale.usercases';
import { ServicesModule } from '../../services/services.module';
import { AcceptOfferUseCases } from './acceptoffer.usecases';
import { CreateBiometricLinkUseCases } from './links.usecases';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';


@Module({
  imports: [
    ConfigModule,
    ServicesModule,
    MongoDbModule, 
    F2pGlobalModule, 
    StotageModule,
    HttpWebApiModule,
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
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:Abc..123@localhost:5672/transactions'],
          queue: 'notifications-events',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'SIGN_EVENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:Abc..123@localhost:5672/transactions'],
          queue: 'sign.events',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'DIGITAL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:Abc..123@localhost:5672/transactions'],
          queue: 'digital-events',
          //noAck: false,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'sign.events',
          type: 'topic',
        },
      ],
      uri: 'amqp://admin:Abc..123@localhost:5672/transactions',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [
    ConfigService,
    {
      provide: 'IExternalFilesUseCases',
      useClass: ExternalFilesUseCases
    },
    {
      provide: 'ICreateBiometricLinkUseCases',
      useClass: CreateBiometricLinkUseCases
    },
    {
      provide: 'IInsertSaleUseCases',
      useClass: InsertSaleUseCases
    },
    
    {
      provide: 'IOneFlowUseCase',
      useClass: OneFlowUseCase
    },
    {
      provide: 'ITwoFlowUseCase',
      useClass: twoFlowUseCase
    },
    {
      provide: 'IAcceptOfferUseCases',
      useClass: AcceptOfferUseCases
    }
  ],
  exports: [
    {
      provide: 'IExternalFilesUseCases',
      useClass: ExternalFilesUseCases
    },
    {
      provide: 'ICreateBiometricLinkUseCases',
      useClass: CreateBiometricLinkUseCases
    },
    {
      provide: 'IInsertSaleUseCases',
      useClass: InsertSaleUseCases
    },
    {
      provide: 'IOneFlowUseCase',
      useClass: OneFlowUseCase
    },
    {
      provide: 'ITwoFlowUseCase',
      useClass: twoFlowUseCase
    },
    {
      provide: 'IAcceptOfferUseCases',
      useClass: AcceptOfferUseCases
    }
  ],
})
export class UseCasesModule { }
