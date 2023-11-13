import { EmailNotificationContract } from '@app/shared/contracts/email.contract';
import { SmsNotificationContract } from '@app/shared/contracts/sms.contract';
import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationsService } from '../services/notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('notification_sms')
  async handleMessageSms(data: SmsNotificationContract) {
    Logger.log(data);
    await this.notificationsService.sendSms(data);
  }

  @EventPattern('notification_email')
  async handleMessageEmail(data: EmailNotificationContract) {
    Logger.log(data);
    await this.notificationsService.sendEmail(data);
  }
}
