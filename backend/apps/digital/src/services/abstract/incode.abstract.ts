/* eslint-disable prettier/prettier */
import { EVENT_LOG, INCODE_GET_OCR_DATA, UPDATE_INFORMATION, UPDATE_STATUS } from "@app/shared/Const/events.const";
import { EventLogContract, UpdateContract, UpdateStatusContract, ValidacionTokenLinkModel, ValidateLinkContract } from "@app/shared/contracts";
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { ClientProxy } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"
export abstract class IncodeAbstract {
    //private readonly logger = new Logger(IncodeAbstract.name);
    readonly coreProxy: ClientProxy;
    readonly digitalProxy: ClientProxy;
    constructor(coreProxy: ClientProxy, digitalProxy: ClientProxy) {
        this.coreProxy = coreProxy;
        this.digitalProxy = digitalProxy;
    }

    public validateTokenUrl = async (token: string, date: Date): Promise<ValidacionTokenLinkModel> => {
        const body: ValidateLinkContract = {
          token: token,
          processDate: date
        }
        const $comd = this.digitalProxy.send<ValidacionTokenLinkModel>('validate_token', body)
        const validacionUrl = await lastValueFrom($comd)
        return validacionUrl;
      }
    
      public updateSession(solicitud: number, fecha: Date, usuario: string, session: string) {
        const body: UpdateContract = {
          Id_Solicitud: solicitud,
          FechaLocal: fecha,
          Usuario: usuario,
          provider_session_id: session
        }
        this.coreProxy.emit(UPDATE_INFORMATION, body)
      }
    
      public updateStatus(solicitud: number, fecha: Date, usuario: string, status: string) {
        const body: UpdateStatusContract = {
          id_solicitud: solicitud,
          fecha: fecha,
          usuario: usuario,
          substatusKey: status
        }
        this.coreProxy.emit(UPDATE_STATUS, body)
      }
    
      public actionLog(action: AcctionType, solicitud: number, fecha: Date, usuario: string, detalle: string) {
        const body: EventLogContract = {
          AcctionType: action,
          FechaLocal: fecha,
          Id_Solicitud: solicitud,
          Usuario: usuario,
          Observacion: detalle
        }
    
        this.coreProxy.emit(EVENT_LOG, body)
      }

      public sendIncodeProcess(command: string, contract: ProcessIncodeDto) {
        this.digitalProxy.emit(command, contract)
      }
}