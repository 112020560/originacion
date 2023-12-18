/* eslint-disable prettier/prettier */
import { CoreService } from "./core.service";
import { EventDriveService } from "./eventdrive.service";
import { FlowStepService } from "./flow-step.service";
import { LinkService } from "./links.service";
import { NotificationServices } from "./notification.service";
import { OtpService } from "./otp.service";
import { GlobalDbService } from "./globaldb.service";


export const customProviders = [
  {
    provide: 'FlowStepInterfaceService',
    useClass: FlowStepService,
  },
  {
    provide: 'OtpInterfaceService',
    useClass: OtpService,
  },
  {
    provide: 'IGlobalDbService',
    useClass: GlobalDbService,
  },
  {
    provide: 'IEventDriveService',
    useClass: EventDriveService,
  },
  {
    provide: 'ICoreService',
    useClass: CoreService,
  },
  {
    provide: 'ILinkService',
    useClass: LinkService,
  },
  {
    provide: 'INotificationServices',
    useClass: NotificationServices,
  },
];
