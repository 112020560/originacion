import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorFilter } from './middleware/exception.middleware';
import { SolicitudModule } from './solicitud.module';

async function bootstrap() {
  const port = process.env.PORT || 3005;
  const app = await NestFactory.create(SolicitudModule);
  app.useGlobalFilters(new ErrorFilter());
  //Middleware
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('/api');
  const config = new DocumentBuilder()
    .setTitle('Solicitud RESTApi')
    .setDescription('ApiRest para solicitudes de Originacion')
    .setVersion('1.0')
    .addTag('solicitudes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  console.log(port);
  await app.listen(port);
}
bootstrap();
