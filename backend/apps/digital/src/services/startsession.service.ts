/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from '@app/infrastructure/api/incode/interfaces/incodeprovider.interface';
import { IncodeStartSessionResponse } from '@app/infrastructure/api/incode/models/startsession.model';
import { ValidateLinkContract } from '@app/shared/contracts/validatelink.contract';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StartDigitalFlowDto } from '../application/dtos/startdigitalflow.dto';
import { lastValueFrom } from 'rxjs';
import { ValidacionTokenLinkModel } from '@app/shared/contracts/validatelink.model';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { ConfigService } from '@nestjs/config';
import { IncodeAbstract } from './abstract/incode.abstract';
import mongoose from 'mongoose';
import { IStartSessionService } from '../domain/interfaces/startsession.interface';

const incode_flow_id = process.env.INCODE_FLOW_ID;
@Injectable()
export class StartSessionService extends IncodeAbstract implements IStartSessionService {
  private readonly logger = new Logger(StartSessionService.name);

  constructor(
    @Inject('IncodeProviderInterfaceService')
    private readonly IncodeProvider: IncodeProviderInterfaceService,
    @Inject('DIGITAL_SERVICE') 
    readonly digitalProxy: ClientProxy,
    @Inject('CORE_SERVICE') 
    readonly coreProxy: ClientProxy,
    @Inject('FolioInterfaceRepository') readonly folioRepository: FolioInterfaceRepository,
    private configService: ConfigService,
  ) {
    super(coreProxy, digitalProxy)
    mongoose.set('debug', true);
  }

  async startSession(dto: StartDigitalFlowDto): Promise<IncodeStartSessionResponse> {
    if (!dto.token) throw new Error('Token is required');
    this.logger.log(`Start Session INCODE. Token = ${dto.token}`);
    //PROCESO DE VALIDACION DEL TOKEN
    const body: ValidateLinkContract = {
      token: dto.token,
      processDate: dto.fechaLocal
    }
    //SE ENVIA POR MEDIO DE MESSAGPATTHER AL SERVICIO ENCARGADO
    const $comd = this.digitalProxy.send<ValidacionTokenLinkModel>('validate_token', body)
    const validacionUrl = await lastValueFrom($comd)
    this.logger.log(validacionUrl);
    //SE VALIDA QUE EL TOKEN ESTE ACTIVO Y VALIDADO
    if (validacionUrl && validacionUrl.Validado) {
      //SE CONSULTA LA SOLICITUD
      const solicitud = await this.folioRepository.findOneByFilter({ id_request: validacionUrl.Id_Solicitud });
      if (solicitud) {
        let response: IncodeStartSessionResponse = null;
        //VALIDAMOS SI ES UNA SESION NUEVA O SI SE RETOMA
        if (solicitud.digitalSesion) {
          this.logger.log(`La solicitud ${validacionUrl.Id_Solicitud} ya tiene una sesion activa, se retoma`);
          response = await this.IncodeProvider.startSessionAsync({
            countryCode: "ALL",
            interviewId: solicitud.digitalSesion
          });
        } else {
          this.logger.log(`La solicitud ${validacionUrl.Id_Solicitud} no tiene sesion, se crea una nueva`);
          response = await this.IncodeProvider.startSessionAsync({
            countryCode: "ALL",
            configurationId: incode_flow_id
          })
          //SE ACTUALIZA LA SOLICITUD CON LA SESION NUEVA
          this.updateSession(validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, response.interviewId);
        }
        //LOGACCION
        this.actionLog(AcctionType.INICIO_SESION_INCODE, validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'INICIO SESION EN INCODE SE REALIZO SATISFACTORIAMENTE');
        //RETIRNAMOS RESPUESTA DE INCODE
        return response;
        //SI NO EXISTE LA SOLICITUD
      } else {
        this.logger.error(`startSession | Solicitud: ${validacionUrl.Id_Solicitud} no existe`);
        throw new Error(validacionUrl.Mensaje ?? `startSession | Solicitud: ${validacionUrl.Id_Solicitud} no existe`);
      }
      //TOKEN NO VALIDADO
    } else {
      this.logger.error(`startSession | TOKEN URL NO VALIDADO: ${validacionUrl.Mensaje}`);
      if (validacionUrl.Id_Solicitud) {
        if (validacionUrl.CurrentStatus == 'COMPLETADO' || validacionUrl.CurrentStatus == 'UTILIZADO') {
          this.actionLog(AcctionType.ERROR_REINTENTO_INICIO_INCODE_FLUJO_TERMINADO, validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'Error al validar el token');
        } else {
          this.updateStatus(validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'ERR');
          this.actionLog(AcctionType.ERROR_VERIFICACION_BIOMETRICA, validacionUrl.Id_Solicitud, dto.fechaLocal, validacionUrl.Usuario_Solicitud, 'Error al validar el token');
        }
      }

      throw new Error(validacionUrl.Mensaje ?? "Error al validar el token");
    }
  }

 

  // private validateTokenUrl = async (token: string, date: Date): Promise<ValidacionTokenLinkModel> => {
  //   const body: ValidateLinkContract = {
  //     token: token,
  //     processDate: date
  //   }
  //   const $comd = this.digitalProxy.send<ValidacionTokenLinkModel>('validate_token', body)
  //   const validacionUrl = await lastValueFrom($comd)
  //   this.logger.debug(`Respuesta validacion token: ${JSON.stringify(validacionUrl)}`);
  //   return validacionUrl;
  // }

  // private updateSession(solicitud: number, fecha: Date, usuario: string, session: string) {
  //   const body: UpdateContract = {
  //     Id_Solicitud: solicitud,
  //     FechaLocal: fecha,
  //     Usuario: usuario,
  //     provider_session_id: session
  //   }
  //   this.coreProxy.emit(UPDATE_INFORMATION, body)
  // }

  // private updateStatus(solicitud: number, fecha: Date, usuario: string, status: string) {
  //   const body: UpdateStatusContract = {
  //     id_solicitud: solicitud,
  //     fecha: fecha,
  //     usuario: usuario,
  //     substatusKey: status
  //   }
  //   this.coreProxy.emit(UPDATE_STATUS, body)
  // }

  // private actionLog(action: AcctionType, solicitud: number, fecha: Date, usuario: string, detalle: string) {
  //   const body: EventLogContract = {
  //     AcctionType: action,
  //     FechaLocal: fecha,
  //     Id_Solicitud: solicitud,
  //     Usuario: usuario,
  //     Observacion: detalle
  //   }

  //   this.coreProxy.emit(EVENT_LOG, body)
  // }

  getHello(): string {
    return 'Hello World!';
  }
}
