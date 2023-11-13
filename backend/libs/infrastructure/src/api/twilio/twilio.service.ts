/* eslint-disable prettier/prettier */
import { SmsNotificationContract } from '@app/shared/contracts/sms.contract';
import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { TwilioInterfaceService } from './interfaces/twilio.interface';
// AccountSid: ACe2de292af1996bc8520deb522264cf6d
// AuthToken: 9dee182f10cfa59a1babca503e374017
// PhoneNumberFrom: "+5074432347"
@Injectable()
export class TwilioService implements TwilioInterfaceService {
    private readonly logger = new Logger(TwilioService.name);

    private readonly accountSid = process.env.TWILIO_ACCOUNT_SID;
    private readonly authToken = process.env.TWILIO_AUTH_TOKEN;
    private readonly phoneFrom = process.env.TWILIO_PHONE_FROM;

    async sendSms(contract: SmsNotificationContract): Promise<void> {
        this.logger.log(`Enviando SMS a ${'+52' + contract.phoneNumber}`);

        const client = new Twilio(this.accountSid, this.authToken);

        const smsResponse = await client.messages.create(
            {
                body: contract.messageBody,
                from: this.phoneFrom,
                to: '+52' + contract.phoneNumber
            }
        );
        this.logger.log(`SMS response: ${JSON.stringify({ smsResponse })}`);
    }
}
