/* eslint-disable prettier/prettier */
import { MongoDbModule } from '@app/infrastructure/mongodb/mongodb.module';
import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DigitalController } from './controllers/digital.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CatalogController } from './controllers/catalog.controller';
import { F2pGlobalModule } from '@app/infrastructure/f2pglobal/f2pglobal.module';
import { queryHandlers } from './application/cqrs/queries';
import { CqrsModule } from '@nestjs/cqrs';
import { commandHandlers } from './application/cqrs/commands';
import { microserviceModules, providerInjector, rabbitMQModule } from './dependencyinyection';
import { SignReciveExternalMessage } from './services/signrecivemessage.service';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpWebApiModule,
    MongoDbModule,
    F2pGlobalModule,
    ...microserviceModules,
    ...rabbitMQModule
  ],
  controllers: [DigitalController, CatalogController],
  providers: [
    SignReciveExternalMessage,
    ...queryHandlers,
    ...commandHandlers,
    ...providerInjector
  ],
})
export class DigitalModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
