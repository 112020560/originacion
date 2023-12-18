import { HttpWebApiModule } from '@app/infrastructure/api/webapi.module';
import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpWebApiModule,
  ],
  controllers: [NotificationsController],
  providers: [ConfigService, NotificationsService],
})
export class NotificationsModule {}
