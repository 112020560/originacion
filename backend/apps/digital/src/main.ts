import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DigitalModule } from './digital.module';
import { ErrorFilter } from './middleware/error.middleware';
import { HttpExceptionFilter } from './middleware/exception.middleware';

async function bootstrap() {
  const port = process.env.DIGITAL_PORT || 3010;
  const app = await NestFactory.create(DigitalModule);
  //Middleware
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ErrorFilter());
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('/api');
  const config = new DocumentBuilder()
    .setTitle('Digital RESTApi')
    .setDescription('ApiRest para solicitudes Digitales')
    .setVersion('1.0')
    .addTag('Digital Services')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
}
bootstrap();
