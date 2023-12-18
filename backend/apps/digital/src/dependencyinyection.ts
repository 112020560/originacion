/* eslint-disable prettier/prettier */
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { APP_FILTER } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from './middleware/exception.middleware';
import { CatalogServices } from './services/catalog.service';
import { ValidateLinkService } from './services/createlink.service';
import { ProcessFaceServices } from './services/processface.service';
import { ProcessIdServices } from './services/processid.service';
import { ProcessRecidenceService } from './services/processrecidence.service';
import { ProcessSignService } from './services/processsign.service';
import { ScoreService } from './services/score.service';
import { StartSessionService } from './services/startsession.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

console.log(process.env.RABBITMQ_URL);

export const providerInjector = [
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
  {
    provide: 'IStartSessionService',
    useClass: StartSessionService,
  },
  {
    provide: 'IProcessIdService',
    useClass: ProcessIdServices,
  },
  {
    provide: 'IProcessFaceServices',
    useClass: ProcessFaceServices,
  },
  {
    provide: 'IProcessRecidenceService',
    useClass: ProcessRecidenceService,
  },
  {
    provide: 'ICatalogServices',
    useClass: CatalogServices,
  },
  {
    provide: 'IProcessSignService',
    useClass: ProcessSignService,
  },
  {
    provide: 'IValidateLinkService',
    useClass: ValidateLinkService,
  },
  {
    provide: 'IScoreService',
    useClass: ScoreService,
  },
];


export const microserviceModules = [
    ClientsModule.register([
        {
          name: 'CORE_SERVICE',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: 'internal-events',
            queueOptions: {
              durable: false,
            },
          },
        },
        {
          name: 'DIGITAL_SERVICE',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: 'digital-events',
            //noAck: false,
            queueOptions: {
              durable: false,
            },
          },
        },
      ]),
]


export const rabbitMQModule = [
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
          {
            name: 'sign.events',
            type: 'topic',
          },
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: false },
      }),
]
