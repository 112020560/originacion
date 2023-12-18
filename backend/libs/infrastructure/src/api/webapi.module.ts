/* eslint-disable prettier/prettier */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BackendService } from './backend/backend.service';
import { IncodeProviderService } from './incode/incode.service';
import { TranslateService } from './translate/translare.service';
import { TwilioService } from './twilio/twilio.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'BackendInterfaceService',
      useClass: BackendService
    },
    {
      provide: 'IncodeProviderInterfaceService',
      useClass: IncodeProviderService
    },
    {
      provide: 'TwilioInterfaceService',
      useClass: TwilioService
    },
    {
      provide: 'TranslateInterfaceService',
      useClass: TranslateService
    }],
  exports: [
    {
      provide: 'BackendInterfaceService',
      useClass: BackendService
    },
    {
      provide: 'IncodeProviderInterfaceService',
      useClass: IncodeProviderService
    },
    {
      provide: 'TwilioInterfaceService',
      useClass: TwilioService
    },
    {
      provide: 'TranslateInterfaceService',
      useClass: TranslateService
    }]
})
export class HttpWebApiModule { }
