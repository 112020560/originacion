/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../entities';
import { MtrSolicitud } from '../entities/MtrSolicitud.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
console.log(process.env.DATA_BASE_INTANCE);
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DATA_BASE_INTANCE,
      username: process.env.DATA_BASE_USER,
      password: process.env.DATA_BASE_PASSWORD,
      database: process.env.DATA_BASE_NAME,
      autoLoadEntities: false,
      entities:[MtrSolicitud ,...entities],
      synchronize: false,
      logging: true,
      logger:'advanced-console',
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options:
      {
        encrypt: false,
        instanceName: process.env.DATA_BASE_INTANCE_NAME,
        trustServerCertificate: true,
        appName: process.env.APPLICATION_NAME
      }
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class DatabaselModule {}
