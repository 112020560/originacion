/* eslint-disable prettier/prettier */
import { LinkSolicitudRepository } from '@app/infrastructure/mongodb/repositories/linksolicitud.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Guid } from "guid-typescript";
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { GenerateLinkContract } from '@app/shared/contracts/generatelink.contract';
import { ValidateLinkContract } from '@app/shared/contracts/validatelink.contract';
import { ValidacionTokenLinkModel } from '@app/shared/contracts/validatelink.model';
import { LinkResponse } from '@app/shared/contracts/linkresponse.model';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { TokenService } from './token.service';
import { ClientLinkModel } from '../domain/models/clientlink.model';
import { Folio } from '@app/infrastructure/mongodb/entities/folio.entity';


const BASE_URL: string = process.env.FRONT_CLIENT_URL;
const DAY_EXPIRED = Number(process.env.DAY_EXPIRED_URL);

const controllers = [{ name: 'biometric', value: `#/?token=` }, { name: 'sign', value: '#/sign?token=' }];
@Injectable()
export class DigitalService {
    private readonly logger = new Logger(DigitalService.name);

    constructor(
        private readonly linkRepository: LinkSolicitudRepository,
        @Inject('FolioInterfaceRepository') readonly folioRepository: FolioInterfaceRepository,
        private readonly tokenService: TokenService,
    ) {
        mongoose.set('debug', true);
    }

    //TODO:: VALIDA ESTADOS Y VIGENCIAS AL CREAR LOS LINKS

    public async validateLink(contract: ValidateLinkContract): Promise<ValidacionTokenLinkModel> {
        //Obtenemos el registro del link generado
        console.log('Decoding Token');
        const decodeToken = await this.tokenService.verifyToken(contract.token, null)
        console.log('Decode Token', decodeToken);
        const decodeObject: ClientLinkModel = JSON.parse(decodeToken)
        const linkRecord = await this.linkRepository.findOneByFilter({ Token: decodeObject.tokenid, Id_Solicitud: decodeObject.Id_Solicitud });
        if (linkRecord) {
            switch (linkRecord.Estado) {
                case 'PROCESO':
                case 'NUEVO':
                case 'ACTIVO':
                    {
                        if (new Date(linkRecord.FechaVencimiento) >= new Date(contract.processDate)) {
                            return {
                                Validado: true,
                                Id_Solicitud: linkRecord.Id_Solicitud,
                                Usuario_Solicitud: linkRecord.UsuarioGenera,
                                CurrentStatus: linkRecord.Estado,
                                Existe: true
                            }
                        } else {
                            await this.linkRepository.update({ _id: new ObjectId(linkRecord.id) }, {
                                $set: {
                                    Estado: 'VENCIDO',
                                    FechaUtilizo: contract.processDate
                                }
                            });
                            return {
                                Validado: false,
                                Id_Solicitud: linkRecord.Id_Solicitud,
                                Usuario_Solicitud: linkRecord.UsuarioGenera,
                                Mensaje: `Lo sentimos, su link ha expirado. Pronto nos comunicaremos contigo para\r\nenviarte un nuevo link o contáctanos al 559 225 5765 y con gusto te ayudaremos.`,
                                CurrentStatus: linkRecord.Estado,
                                Existe: true
                            }
                        }
                    }
                case 'VENCIDO': {
                    return {
                        Validado: false,
                        Id_Solicitud: linkRecord.Id_Solicitud,
                        Usuario_Solicitud: linkRecord.UsuarioGenera,
                        Mensaje: `Lo sentimos, su link ha expirado. Pronto nos comunicaremos contigo para\r\nenviarte un nuevo link o contáctanos al 559 225 5765 y con gusto te ayudaremos.`,
                        CurrentStatus: linkRecord.Estado,
                        Existe: true
                    }
                }
                case 'COMPLETADO':
                case 'UTILIZADO': {
                    return {
                        Validado: false,
                        Id_Solicitud: linkRecord.Id_Solicitud,
                        Usuario_Solicitud: linkRecord.UsuarioGenera,
                        Mensaje: linkRecord.Observacion ?? "Tu proceso digital ya fue completado.",
                        CurrentStatus: linkRecord.Estado,
                        Existe: true
                    }
                }
                case 'ERROR-CURP':
                    {
                        return {
                            Validado: false,
                            Id_Solicitud: linkRecord.Id_Solicitud,
                            Usuario_Solicitud: linkRecord.UsuarioGenera,
                            Mensaje: 'Lo sentimos, tu link se ha desactivado ya que el CURP ingresado en la solicitud es diferente al obtenido del flujo digital.',
                            CurrentStatus: linkRecord.Estado,
                            Existe: true
                        }
                    }
                case 'CURP-VACIO':
                    {
                        return {
                            Validado: false,
                            Id_Solicitud: linkRecord.Id_Solicitud,
                            Usuario_Solicitud: linkRecord.UsuarioGenera,
                            Mensaje: 'Lo sentimos, tu link se ha desactivado ya que el INCODE no pudo extraer el CURP del INE.',
                            CurrentStatus: linkRecord.Estado,
                            Existe: true
                        }
                    }
                case 'ERROR-FECHA_DOC':
                    {
                        return {
                            Validado: false,
                            Id_Solicitud: linkRecord.Id_Solicitud,
                            Usuario_Solicitud: linkRecord.UsuarioGenera,
                            Mensaje: linkRecord.Observacion ?? 'Lo sentimos, tu link se ha desactivado ya que la fecha del documento de domicilio no esta dentro del rango permitido.',
                            CurrentStatus: linkRecord.Estado,
                            Existe: true
                        }
                    }
                case 'INCODE-SCORE':
                    {
                        return {
                            Validado: false,
                            Id_Solicitud: linkRecord.Id_Solicitud,
                            Usuario_Solicitud: linkRecord.UsuarioGenera,
                            Mensaje: linkRecord.Observacion ?? 'Lo sentimos! No podemos continuar con tu solicitud de línea de crédito.',
                            CurrentStatus: linkRecord.Estado,
                            Existe: true
                        }
                    }
                case 'ERROR': {
                    return {
                        Validado: false,
                        Id_Solicitud: linkRecord.Id_Solicitud,
                        Usuario_Solicitud: linkRecord.UsuarioGenera,
                        Mensaje: 'Lo sentimos! No podemos continuar con tu solicitud de línea de crédito.',
                        CurrentStatus: linkRecord.Estado,
                        Existe: true
                    }
                }
                default:
                    return {
                        Validado: false,
                        Id_Solicitud: linkRecord.Id_Solicitud,
                        Usuario_Solicitud: linkRecord.UsuarioGenera,
                        Mensaje: 'Lo sentimos, tu link ha expirado. Pronto nos comunicaremos contigo para\r\nenviarte un nuevo link o contáctanos al 559 225 5765 y con gusto te ayudaremos.',
                        CurrentStatus: linkRecord.Estado,
                        Existe: true
                    }
            }
        } else {
            return {
                Validado: false,
                Mensaje: `Token ${contract.token} no existe`,
                Existe: false
            }
        }
    }

    public async generateLink(contract: GenerateLinkContract): Promise<LinkResponse> {
        const id_solicitud = contract.id_solicitud;
        this.logger.log(`Solicitud ${id_solicitud} - Generando link para el flujo ${contract.digitalFlow}`);
        try {
            // const link = await this.linkRepository.findOneByFilter({
            //     Id_Solicitud: id_solicitud,
            //     Estado: { $in: ['ACTIVA', 'COMPLETADO', 'UTILIZADO'] }
            // })
            // console.log('Link para validar = ',link);
            // if (link) {
            //     return {
            //         success: false,
            //         link: null,
            //         token: null,
            //         error: 'Error al generar el link, solicitud cuenta con link activo o ya finalizo su proceso'
            //     }
            // }
            //PRIMERO CONSULTAMOS LA INFORMACION DEL FOLIO
            const solicitud = await this.folioRepository.findOneByFilter({ id_request: id_solicitud, status: 'ACTIVA' });
            //MANDAMOS A VALIDAR LAS REGRAS DE CREACION DE LINK
            const validate = await this.linkValidate(solicitud, id_solicitud, contract.digitalFlow)
            if (validate) {

                //VALIDAMOS QUE EXISTA LA SOLICITUD

                if (solicitud) {
                    const token: string = Guid.create().toString().replace('-', '');

                    const tokenEncode = await this.tokenService.generateToken({
                        tokenid: token,
                        Id_Solicitud: id_solicitud,
                        flow: contract.digitalFlow,
                    }, null)

                    const controller = controllers.find(x => x.name == contract.digitalFlow)
                    console.log(controller);
                    const urlLink = `${BASE_URL}${controller.value}${tokenEncode}`.replace('//', '/')
                    const currentDate = new Date();
                    console.log(currentDate)
                    console.log(DAY_EXPIRED)
                    //currentDate.setDate(DAY_EXPIRED);
                    currentDate.setDate(new Date(currentDate).getDate() + DAY_EXPIRED)
                    // const fechaVencimiento = currentDate;
                    console.log(currentDate)
                    this.logger.log(`Folio ${id_solicitud} - Link Generado: ${urlLink} y vence ${currentDate}`);
                    //SE MANDA A GUARDAR EL REGISTRO DEL LINK SOLICITADO
                    await this.linkRepository.create({
                        Id_Solicitud: id_solicitud,
                        FechaGeneracion: contract.processDate,
                        FechaVencimiento: currentDate,
                        Tipo: contract.digitalFlow,
                        Token: token,
                        UsuarioGenera: contract.userName,
                        Link: urlLink,
                        Estado: 'NUEVO',
                        Reenvios: 3, //Esto debe ser confogurable
                        Renviar: true,
                        CanalEnvio: solicitud.kyc.informacionPersonal.TelefonoCelular,
                        FechaUtilizo: null,
                        CreatedAt: contract.processDate,
                        Observacion: ''
                    });



                    return {
                        success: true,
                        link: urlLink,
                        token: tokenEncode
                    }
                }//NO TIENE ELSE XQ SI ESTE NO ES TRUE GENERA UNA EXCEPCION 
            } else {
                console.error('error');
                throw (`LA SOLICITUD ${id_solicitud} NO EXISTE O NO TIENE UN ESTADO VALIDO`);
            }
        } catch (error: any) {
            console.log(error)
            this.logger.error(`Error al intentar generar el link ${contract.digitalFlow} para la solicitud ${id_solicitud}: ${JSON.stringify({ error })}`);
            return {
                success: false,
                link: null,
                token: null,
                error: `Error al generar el link ${contract.digitalFlow} para la Solicitud [${id_solicitud}]: ${error} `
            }
        }
    }

    async linkValidate(folio: Folio, id_solicitud: number, digitalFlow: string | null): Promise<boolean> {
        if (folio) {
            if (folio.subStatus == 'CONTRATO FIRMADO') throw Error(`No se puede generar link de tipo ${digitalFlow} ya que la solicitud ya tiene contrato firmado`)

            const linkRecord = await this.linkRepository.find({ Id_Solicitud: id_solicitud }); //Tipo: digitalFlow, Estado: { $in: ['NUEVO', 'ACTIVO', 'PROCESO'] } });
            if (linkRecord) {
                switch (digitalFlow) {
                    case 'biometric':
                        {
                            if (linkRecord.find(x => x.Tipo == 'sign')) throw (`No se puede generar el link ya que existe un link de firma activo`);

                            if (linkRecord.find(x => x.Tipo == 'biometric' && (x.Estado == 'NUEVO' || x.Estado == 'ACTIVO' || x.Estado == 'PROCESO'))) throw (`No se puede generar el link ya que el cliente aun tiene un Link activo`);

                            if (linkRecord.find(x => x.Tipo == 'biometric' && (x.Estado == 'ERROR-CURP' || x.Estado == 'CURP-VACIO'))) throw (`No se puede generar el link ya que el cliente posee problemas con la validacion del CURP`);

                            return true;
                        }
                    case 'sign':
                        {
                            if (linkRecord.find(x => x.Tipo == 'biometric' && (x.Estado == 'NUEVO' || x.Estado == 'ACTIVO' || x.Estado == 'PROCESO'))) throw (`No se puede generar el link ya que no se ha completado el flujo biometrico`);

                            if (linkRecord.find(x => x.Tipo == 'biometric' && (x.Estado == 'ERROR-CURP' || x.Estado == 'CURP-VACIO'))) throw (`No se puede generar el link ya que el cliente posee problemas con la validacion del CURP`);

                            if (linkRecord.find(x => x.Tipo == 'sign' && (x.Estado == 'NUEVO' || x.Estado == 'ACTIVO' || x.Estado == 'PROCESO'))) throw (`No se puede generar el link ya que existe un link para firma sin completar`);

                            return true;
                        }
                    default:
                        return true;
                }
            } else {
                return true;
            }
        } else {
            throw (`La solicitud ${id_solicitud} No existe`);
        }
    }
}
