import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { StotageModule } from '@app/infrastructure/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DigitalController } from './controllers/digital-service.controller';
import { IncodeController } from './controllers/incode.controller';
import { AllIncodeProcess } from './services/allincodeprocess.service';
import { DigitalService } from './services/digitalurl.service';
import { IncodeFilesService } from './services/incode-files.service';
import { IncodeOcrService } from './services/incode-ocr.service';
import { IncodeScoreService } from './services/incode-score.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    F2pGlobalModule,
    MongoDbModule,
    HttpWebApiModule,
    ConfigModule,
    StotageModule,
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
    // JwtModule.register({
    //   secret: 'pXhI-gTB-VO9Fk;S3>ZX`wANW#TwRc',
    //   signOptions: { expiresIn: '60s' },
    // }),
  ],
  controllers: [DigitalController, IncodeController],
  providers: [
    DigitalService,
    {
      provide: 'IIncodeOcrService',
      useClass: IncodeOcrService,
    },
    {
      provide: 'IIncodeScoreService',
      useClass: IncodeScoreService,
    },
    {
      provide: 'IIncodeFilesService',
      useClass: IncodeFilesService,
    },
    {
      provide: 'IAllIncodeProcess',
      useClass: AllIncodeProcess,
    },
    ConfigService,
    TokenService,
  ],
})
export class DigitalServiceModule {}
