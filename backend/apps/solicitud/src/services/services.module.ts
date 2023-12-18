/* eslint-disable prettier/prettier */
import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoreService } from './core.service';
import { customProviders } from './dependencyinjection';
import { EventDriveService } from './eventdrive.service';
import { FlowStepService } from './flow-step.service';
import { LinkService } from './links.service';
import { NotificationServices } from './notification.service';
import { OtpService } from './otp.service';
import { GlobalDbService } from './globaldb.service';

@Module({
  imports: [
    ConfigModule,
    MongoDbModule,
    F2pGlobalModule,
    HttpWebApiModule,
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
  ],
  providers: [
    ConfigService,
    ...customProviders
    // {
    //   provide: 'FlowStepInterfaceService',
    //   useClass: FlowStepService
    // },
    // {
    //   provide: 'OtpInterfaceService',
    //   useClass: OtpService
    // },
    // {
    //   provide: 'IGlobalDbService',
    //   useClass: GlobalDbService
    // },
    // {
    //   provide: 'IEventDriveService',
    //   useClass: EventDriveService
    // },
    // {
    //   provide: 'ICoreService',
    //   useClass: CoreService
    // },
    // {
    //   provide: 'ILinkService',
    //   useClass: LinkService
    // },
    // {
    //   provide: 'INotificationServices',
    //   useClass: NotificationServices
    // }],
  ],
  exports: [
    ...customProviders
    // {
    //   provide: 'FlowStepInterfaceService',
    //   useClass: FlowStepService
    // },
    // {
    //   provide: 'OtpInterfaceService',
    //   useClass: OtpService
    // },
    // {
    //   provide: 'IGlobalDbService',
    //   useClass: GlobalDbService
    // },
    // {
    //   provide: 'IEventDriveService',
    //   useClass: EventDriveService
    // },
    // {
    //   provide: 'ICoreService',
    //   useClass: CoreService
    // },
    // {
    //   provide: 'ILinkService',
    //   useClass: LinkService
    // },
    // {
    //   provide: 'INotificationServices',
    //   useClass: NotificationServices
    // }
  ], // export all services here to be used in other modules.
})
export class ServicesModule { }
