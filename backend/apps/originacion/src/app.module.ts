import { ServicesModule } from './services/services.module';
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { SolicitudController } from './controllers/solicitud.controller';
import { ConfigService } from '@nestjs/config';
import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';

@Module({
  imports: [ServicesModule, HttpWebApiModule],
  controllers: [AppController, SolicitudController],
  providers: [ConfigService],
  exports: [],
})
export class AppModule {}
