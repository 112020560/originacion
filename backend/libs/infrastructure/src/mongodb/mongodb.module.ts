/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepositoryModule } from './repositories/repository.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
    imports: [
        MongooseModule.forRoot('mongodb+srv://admin:x3zYKOsKqX4mL3ol@uat.gnd1i.mongodb.net/Originacion?retryWrites=true&w=majority', {
            dbName:'Originacion'
        }),
        // TypeOrmModule.forRoot({
        //     type: 'mongodb',
        //    url: 'mongodb+srv://akrosadmin:Akros12345678@cluster0.yh8to.mongodb.net/originacion',
        //     ssl: true,
        //     entities:[LinksSolicitud, FlujoDigital, Folio, AceptaOfertaSolicitud, WorkFlowStep],
        //     autoLoadEntities: false,

        //     // Only enable this option if your application is in development,
        //     // otherwise use TypeORM migrations to sync entity schemas:
        //     // https://typeorm.io/#/migrations
        //     synchronize: false,
        //     logging: true,
        //     logger:'advanced-console',
        // }),
        RepositoryModule
    ],
    providers: [],
    exports: [RepositoryModule]
})
export class MongoDbModule { }
