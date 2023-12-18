/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const rabbitUrl = configService.get('RABBITMQ_URL');
  const internalQueue = configService.get('RABBITMQ_INTERNAL_QUEUE');
  const digitalQueue = configService.get('RABBITMQ_DIGITAL_QUEUE');

  console.log(`rabbitUrl: ${rabbitUrl}`);
  console.log(`internalQueue: ${internalQueue}`);
  console.log(`digitalQueue: ${digitalQueue}`);

  ///Listener Internal
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: internalQueue,
      queueOptions: {
        durable: false,
      },
    },
  });

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options:{
  //     host:'localhost',
  //     port:8081
  //   }
  // });

  await app.startAllMicroservices();
}
bootstrap();
