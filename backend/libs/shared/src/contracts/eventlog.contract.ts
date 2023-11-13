/* eslint-disable prettier/prettier */
import { AcctionType } from '../enums/eventlog.enum';
import { GenericContract } from './generic.contract';

export class EventLogContract extends GenericContract {
  AcctionType?: AcctionType;
  Observacion?: string;
}
