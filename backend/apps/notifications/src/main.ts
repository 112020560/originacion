import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);

  const rabbitUrl = configService.get('RABBITMQ_URL');
  const notificationQueue = configService.get('RABBITMQ_NOTIFICATION_QUEUE');

  console.log(`rabbitUrl: ${rabbitUrl}`);
  console.log(`notificationQueue: ${notificationQueue}`);

  ///Listener notification
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: notificationQueue,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
