import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileServiceController } from './controllers/file-service.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FileServiceService } from '@app/infrastructure/storage/file-service.service';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'FILE_SERVICE',
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
    F2pGlobalModule,
  ],
  controllers: [FileServiceController],
  providers: [FileServiceService],
})
export class FileServiceModule {}
