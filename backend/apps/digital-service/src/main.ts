import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DigitalServiceModule } from './digital-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DigitalServiceModule);
  const configService = app.get(ConfigService);

  const rabbitUrl = configService.get('RABBITMQ_URL');
  const digitalQueue = configService.get('RABBITMQ_DIGITAL_QUEUE');

  console.log(`rabbitUrl: ${rabbitUrl}`);
  console.log(`digitalQueue: ${digitalQueue}`);

  ///Listener Internal
  app.connectMicroservice<MicroserviceOptions>({
    // transport: Transport.TCP,
    // options: {
    //   host: 'localhost',
    //   port: 3012,
    // },
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: digitalQueue,
      //noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
