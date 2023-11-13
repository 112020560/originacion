/* eslint-disable prettier/prettier */
import { SmsNotificationContract } from "@app/shared/contracts/sms.contract";

export interface TwilioInterfaceService {
    sendSms(contract: SmsNotificationContract): Promise<void>;
}