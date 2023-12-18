/* eslint-disable prettier/prettier */
import { BackendDataBase, BackendRequestType, DataBaseEngine } from '@app/shared/enums/backendmethod.enum';
import { BackendParam } from './backend.params';

export class BackendRequest {
  ApplicationId: string;
  Country: string;
  Engine: DataBaseEngine;
  Flag: number;
  DataBase: BackendDataBase;
  Metodo: BackendRequestType;
  Procedimiento: string;
  Params: BackendParam[];
  Columns: string[];
}
