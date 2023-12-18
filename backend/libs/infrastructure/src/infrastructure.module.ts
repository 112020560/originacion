import { Module } from '@nestjs/common';
import { HttpWebApiModule } from './api/webapi.module';
import { F2pGlobalModule } from './f2pglobal/f2pglobal.module';
import { MongoDbModule } from './mongodb/mongodb.module';
import { StotageModule } from './storage/storage.module';

@Module({
  imports: [F2pGlobalModule, StotageModule, MongoDbModule, HttpWebApiModule],
  providers: [],
  exports: [F2pGlobalModule, StotageModule, MongoDbModule, HttpWebApiModule],
})
export class InfrastructureModule {}
