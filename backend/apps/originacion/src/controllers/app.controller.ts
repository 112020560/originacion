import { EVENT_LOG } from '@app/shared/Const/events.const';
import { EventLogContract } from '@app/shared/contracts/eventlog.contract';
import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EventLogService } from '../services/eventlog.service';

@Controller()
export class AppController {
  constructor(private readonly eventlogRepository: EventLogService) {}

  @EventPattern(EVENT_LOG)
  async handleMessagePrinted(data: EventLogContract) {
    Logger.log(data);
    await this.eventlogRepository.createEventLog(data);
  }
}
