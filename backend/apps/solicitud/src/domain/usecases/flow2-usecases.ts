/* eslint-disable prettier/prettier */
import { TranslateInterfaceService } from "@app/infrastructure/api/translate/interfaces/translate.interface";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { Inject, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import mongoose from 'mongoose';
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { TrasladeRequest } from "@app/infrastructure/api/translate/dto/translate.dto";
import { PRODUCTO, RespuestaFlujo2Model } from "@app/infrastructure/api/translate/dto/translateresponseF2";
import { Buro } from "@app/infrastructure/mongodb/entities/partial-entities/buro.entoty";
import { BackendInterfaceService } from "@app/infrastructure/api/backend/interfaces/backend.interface";
import { BackendParam } from "@app/infrastructure/api/backend/models/backend.params";
import { BackendDataBase, BackendRequestType, DataBaseEngine } from "@app/shared/enums/backendmethod.enum";
import { ConfigService } from "@nestjs/config";
import { OtpInterfaceService } from "../../services/interfaces/otpservice.interface";
import { FlujosIngresoDto } from "../../application/dtos/flujos.dto";
import { Escenarios, OfertaCrediticiaModel } from "../models/creditoffer.model";
import { ValidateOtp } from "../models/validateotp.model";
import { CommonFunctions } from "./abstract/blazeflow.abstract";
import { ITwoFlowUseCase } from "../interfaces/flow2.interface";
import { Guid } from "guid-typescript";
export class twoFlowUseCase extends CommonFunctions implements ITwoFlowUseCase {

    private readonly logger = new Logger(twoFlowUseCase.name);

    constructor(
        private configService: ConfigService,
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject("CORE_SERVICE")
        readonly coreproxy: ClientProxy,
        @Inject('TranslateInterfaceService')
        private readonly translateService: TranslateInterfaceService,
        @Inject('OtpInterfaceService')
        private readonly otpService: OtpInterfaceService,
        @Inject('BackendInterfaceService')
        private readonly backendService: BackendInterfaceService
    ) {
        super(folioRepository, coreproxy)
        mongoose.set('debug', true);
    }

    public async execute(solicitudKyCModel: FlujosIngresoDto): Promise<OfertaCrediticiaModel> {
        this.logger.log(`Analisis Flujo 2 de blaze para la solicitud ${solicitudKyCModel.id_Solicitud}`)
        //SE TRANSFORMA LA FECHA DE UNIX A STANDAR
        const date = new Date(solicitudKyCModel.informacion.informacionPersonal.FechaNacimiento * 1000);
        const id_solicitud = solicitudKyCModel.id_Solicitud;
        const userName = solicitudKyCModel.usuario ?? 'originacion';
        let estado = "F2"
        //PROCESO DE VALIDACION DE OTP SE PUDO HABER VALIDADO DESDE EL ENPOINT
        let validacionPin: ValidateOtp = null;
        if (solicitudKyCModel.otpInformation && solicitudKyCModel.otpInformation.external_validate) {
            validacionPin = {
                validate: solicitudKyCModel.otpInformation.validated,
                message: solicitudKyCModel.otpInformation.validated ? 'VALIDACION OTP EXTENA SATISFACTORA' : 'ERROR VALIDACION OTP EXTERNO'
            }
        } else {
            this.logger.log(`${id_solicitud} - Validando OTP ${solicitudKyCModel.informacion.informacionAdicional.Pin}`)
            validacionPin = await this.otpService.otpValidate({
                fechaLocal: solicitudKyCModel.fechaLocal,
                enviar: false,
                id_Solicitud: id_solicitud,
                otp: solicitudKyCModel.informacion.informacionAdicional.Pin,
                telefonoCelular: '',
                usuario: solicitudKyCModel.usuario
            });
        }
        const sub_origen = 3;
        const marca = 1;
        const agente = "99";
        const pais = "52";
        let nombre_completo = solicitudKyCModel.informacion.informacionPersonal.Nombre.trim();
        nombre_completo = nombre_completo.concat(' ',
            solicitudKyCModel.informacion.informacionPersonal.SegundoNombre,
            ' ',
            solicitudKyCModel.informacion.informacionPersonal.ApellidoPaterno,
            ' ',
            solicitudKyCModel.informacion.informacionPersonal.ApellidoMaterno);
        try {
            const buro: Buro[] = []
            estado = "PIN";
            //VALIDACION DEL OTP
            if (validacionPin && validacionPin.validate) {
                this.logger.log(`${id_solicitud} - OTP Validado con exito`)
                //ENVIAMOS EL EVENTO 
                this.sendEventLog(AcctionType.OTP_VERIFICADO, id_solicitud, date, userName, 'VERIFICACION CORRECTA DEL PIN');
                //EJECUCION DEL TRASLATE
                const requestFlujo2: TrasladeRequest = {
                    STR_COD_PAIS: pais,
                    SIN_FACE: 2,
                    STR_NACIONALIDAD: "Mexico_mexicano",
                    STR_USUARIO_CREACION: agente,
                    INT_SUB_ORIGEN: sub_origen,
                    BIN_ID_SOLICITUD_REF: id_solicitud,
                    GENERO: solicitudKyCModel.informacion.informacionPersonal.Genero,
                    STR_CEDULA: solicitudKyCModel.informacion.informacionPersonal.Curp,
                    FEC_NACIMIENTO: date.toISOString(),
                    INGRESO_BRUTO: solicitudKyCModel.informacion.informacionPersonal.IngresoMensualBruto,
                    OCUPACION: solicitudKyCModel.informacion.informacionPersonal.Oficio,
                    PROFESION: solicitudKyCModel.informacion.informacionPersonal.Profesion.toString(),
                    STR_EMAIL: solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico,
                    STR_OCUPACION: solicitudKyCModel.informacion.informacionPersonal.Oficio,
                    Fk_Suv_Cat_Marca: marca
                }

                let responseFlujo2 = await this.translateService.invokeBlaze<RespuestaFlujo2Model>(requestFlujo2);
                let responseCodeF2 = responseFlujo2.F2P_FILE.TRANSACTION_RESPONSE.RESPONSE_CODE;

                this.logger.log(`${id_solicitud} - $Codigo: ${responseCodeF2} Respuesta Flujo [2.1] Blaze ${JSON.stringify(responseFlujo2)} `);

                //REGISTRAMOS LA PRIMER RESPUESTA DEL BURO
                buro.push(
                    {
                        buro: 'FLUJO 2 BLAZE (1)',
                        fecha: date,
                        respuesta: JSON.stringify(responseFlujo2)
                    }
                )
                //VALIDAMOS SI LA RESPUESTA FUE EXITOSA
                if (responseCodeF2 == 'ACK00') {
                    //LLEVAMOS EL REGISTRO DEL ESTADO 
                    estado = 'F2';
                    //ENVIAMOS EL LOG DE EVENTOS
                    this.sendEventLog(AcctionType.BLAZE_F2, id_solicitud, date, userName, responseCodeF2)
                    if (responseFlujo2.F2P_FILE?.OTROS_DATOS_FLAG?.PANTALLA_OFER_CREDIT != null &&
                        responseFlujo2.F2P_FILE.OTROS_DATOS_FLAG.PANTALLA_OFER_CREDIT == "1") {
                        //PROCESAMOS LA OFERTA CREDITICIA
                        await this.execBackendOffert(solicitudKyCModel);

                        responseFlujo2 = await this.translateService.invokeBlaze<RespuestaFlujo2Model>(requestFlujo2);
                        responseCodeF2 = responseFlujo2.F2P_FILE.TRANSACTION_RESPONSE.RESPONSE_CODE;

                        this.logger.log(`${id_solicitud} - Respuesta Flujo [2.2] Blaze ${JSON.stringify(responseFlujo2)} `);

                        //ACTUALIZAMOS LA INFORMACION DE LAS RESPUESTAS DEL BURO EN MONGO
                        buro.push(
                            {
                                buro: 'FLUJO 2 BLAZE (2)',
                                fecha: date,
                                respuesta: JSON.stringify(responseFlujo2)
                            });
                    }
                    //ACTUALIZAMOS LA INFORMACION EN MONGODB
                    await this.GuardarRegistroKyCAsync(solicitudKyCModel, buro)
                    //VALIDAMOS LAS RESPUESTAS DE BLAZE
                    if (responseCodeF2 != null && responseCodeF2 == "ACK00") {
                        if (responseFlujo2.F2P_FILE != null && responseFlujo2.F2P_FILE.ESCENARIOS != null) {
                            //OBTENEMOS TODOS LOS PRODUCTOS
                            const items = responseFlujo2.F2P_FILE.ESCENARIOS.PRODUCTO;
                            if (items && items.length > 0) {
                                //VALIDAMOS SI EXISTE EL PRODUCTO -1 PARA ELIMINARLO
                                const itemToRemove = responseFlujo2.F2P_FILE.ESCENARIOS.PRODUCTO.findIndex(r => r.ID_PRODUCTO == "-1");
                                if (itemToRemove >= 0) {
                                    items.splice(itemToRemove, 1);
                                }
                                estado = 'OFERTA';
                                return {
                                    Aprobado: true,
                                    Escenarios: this.matchObjectResponse(responseFlujo2.F2P_FILE.ESCENARIOS.PRODUCTO),
                                    Mensaje: 'Oferta generada por Blaze'
                                };
                            }
                        }
                    } else {
                        estado = "RF2";
                        const mensajeRechazo = this.procesarMensajeRespuestaBlaze(responseFlujo2);

                        this.sendEventLog(AcctionType.RECHAZO_BLAZE_F2, id_solicitud, date, solicitudKyCModel.usuario, mensajeRechazo);

                        return {
                            Aprobado: false,
                            Escenarios: null,
                            Mensaje: responseCodeF2 == 'ACK01' ? `"RECHAZO POR REGLAS INTERNAS: ${mensajeRechazo}` : responseCodeF2 == "ACK500" ? "CLIENTE YA POSEE VENTA ACTIVA" : "RECHAZO POR REGLAS INTERNAS"
                        }

                    }

                } else {
                    estado = "RF2";
                    const mensajeRechazo = this.procesarMensajeRespuestaBlaze(responseFlujo2);

                    this.sendEventLog(AcctionType.RECHAZO_BLAZE_F2, id_solicitud, date, solicitudKyCModel.usuario, mensajeRechazo);

                    return {
                        Aprobado: false,
                        Escenarios: null,
                        Mensaje: responseCodeF2 == 'ACK01' ? `"RECHAZO POR REGLAS INTERNAS: ${mensajeRechazo}` : responseCodeF2 == "ACK500" ? "CLIENTE YA POSEE VENTA ACTIVA" : "RECHAZO POR REGLAS INTERNAS"
                    }
                }

            } else {
                this.logger.error(`${solicitudKyCModel.id_Solicitud} - Error validando OTP: ${validacionPin.message}`)
                this.sendEventLog(AcctionType.ERROR_VERIFICACION_OTP, solicitudKyCModel.id_Solicitud, date, solicitudKyCModel.usuario, validacionPin.message);
                estado = "ERROR-PIN";
                return {
                    Aprobado: false,
                    Mensaje: validacionPin.message,
                    Escenarios: []
                }
            }
        } catch (error) {
            this.logger.log(`${id_solicitud} - Error Flujo 2 Blaze: ${JSON.stringify({ error })}`);
            estado = 'ERROR';
            this.sendEventLog(AcctionType.ERROR, id_solicitud, date, solicitudKyCModel.usuario, `SolicitudFlujo2 - ${JSON.stringify(error)}`);
            throw new Error(JSON.stringify(error));

        } finally {
            this.logger.log(`${id_solicitud} - Actualiza subestado de la solicitud a  ${estado} `);
            this.sendUpdateStatus(id_solicitud, date, solicitudKyCModel.usuario, estado)
        }
    }

    private async execBackendOffert(solicitudKyCModel: FlujosIngresoDto) {
        this.logger.log(`${solicitudKyCModel.id_Solicitud} - EJECUNTADO [ PA_PRO_CONSULTA_CREDITICIA ] A TRAVES DEL BACKEND`);

        const date = new Date(solicitudKyCModel.informacion.informacionPersonal.FechaNacimiento * 1000);

        const parameters: BackendParam[] = [
            { Parametro: "P_IDENTIFICACION", Valor: solicitudKyCModel.informacion.informacionPersonal.Curp },
            { Parametro: "P_COD_AGENTE", Valor: '99' },
            { Parametro: "P_OCUPACION", Valor: solicitudKyCModel.informacion.informacionPersonal.Oficio },
            { Parametro: "P_SALARIO_GESTION", Valor: solicitudKyCModel.informacion.informacionPersonal.IngresoMensualBruto },
            { Parametro: "P_PROFESION", Valor: solicitudKyCModel.informacion.informacionPersonal.Profesion },
            { Parametro: "P_SALARIO_OTROS", Valor: 0 },
            { Parametro: "P_CANT_DEPENDIENTES", Valor: 0 },
            { Parametro: "P_SEXO", Valor: solicitudKyCModel.informacion.informacionPersonal.Genero == "Masculino" ? "1" : "2" },
            { Parametro: "P_ESTADO_CIVIL", Valor: "1" },
            { Parametro: "P_STR_NOMBRE_1", Valor: solicitudKyCModel.informacion.informacionPersonal.Nombre },
            { Parametro: "P_STR_NOMBRE_2", Valor: solicitudKyCModel.informacion.informacionPersonal.SegundoNombre },
            { Parametro: "P_STR_APELLIDO_1", Valor: solicitudKyCModel.informacion.informacionPersonal.ApellidoPaterno },
            { Parametro: "P_STR_APELLIDO_2", Valor: solicitudKyCModel.informacion.informacionPersonal.ApellidoMaterno },
            { Parametro: "P_FECHA_NACIMIENTO", Valor: date },
            //DateTimeOffset.FromUnixTimeMilliseconds((solicitudKyCModel.informacion.informacionPersonal.FechaNacimiento/1000)).DateTime.ToString("yyyy-MM-dd") },
            { Parametro: "P_STR_TEL_CELULAR", Valor: solicitudKyCModel.informacion.informacionPersonal.TelefonoCelular },
            { Parametro: "P_STR_TEL_TRABAJO", Valor: solicitudKyCModel.informacion.informacionLaboral.TelefonoTrabajo },
            { Parametro: "P_INT_SUB_ORIGEN", Valor: 3 },
            { Parametro: "P_FECHA_INGRESO", Valor: "2000-01-01" },
            //PARAMETROS NUEVOS PARA MX
            { Parametro: "P_RFC", Valor: solicitudKyCModel.informacion.informacionPersonal.Rfc },
            { Parametro: "P_DIRECCION", Valor: solicitudKyCModel.informacion.informacionGeografica.Calle },
            { Parametro: "P_COLONIA", Valor: solicitudKyCModel.informacion.informacionGeografica.Colonia },
            { Parametro: "P_MUNICIPIO", Valor: solicitudKyCModel.informacion.informacionGeografica.Municipio },
            { Parametro: "P_CIUDAD", Valor: solicitudKyCModel.informacion.informacionGeografica.Estado },
            { Parametro: "P_ESTADO", Valor: solicitudKyCModel.informacion.informacionGeografica.Estado },
            // { "P_CP", solicitudKyCModel.informacion.informacionGeografica.Estado}
            { Parametro: "P_FOLIO", Valor: "12345" },
            { Parametro: "P_EMAIL", Valor: solicitudKyCModel.informacion.informacionPersonal.CorreoElectronico },
            { Parametro: "P_CODIGO_POSTAL", Valor: solicitudKyCModel.informacion.informacionGeografica.CodigoPostal },
            { Parametro: "P_SOLICITUD_ID", Valor: solicitudKyCModel.id_Solicitud },
            { Parametro: "P_STR_ASALARIADO", Valor: solicitudKyCModel.informacion.informacionPersonal.Oficio },
            { Parametro: "P_STR_NACIONALIDAD", Valor: "MX" },
            ///PARAMETRO NUEVO PARA ENVIAR EL IDENTIFICADOR DE EVA
            { Parametro: "P_EVA_ID", Valor: solicitudKyCModel.informacion.informacionLaboral.IdentificadorEva ?? Guid.create().toString() }
        ]
        try {
            const response = await this.backendService.sendBackendRequest<any>({
                Metodo: BackendRequestType.GET,
                ApplicationId: this.configService.get<string>('BACKEN_APPLICATION_ID'),
                Columns: [],
                Country: solicitudKyCModel.contry ?? this.configService.get<string>('BACKEN_COUNTRY'),
                DataBase: BackendDataBase.F2P_VENTAS,
                Engine: DataBaseEngine.MSSQL,
                Flag: 0,
                Params: parameters,
                Procedimiento: 'PA_PRO_CONSULTA_CREDITICIA'
            })

            this.logger.log(`${solicitudKyCModel.id_Solicitud} - RESPUESTA DE [ PA_PRO_CONSULTA_CREDITICIA ] ${JSON.stringify(response)}`);

            this.sendEventLog(AcctionType.OFERTA_CREDITICIA, solicitudKyCModel.id_Solicitud, date, solicitudKyCModel.usuario, 'CONSULTA CREDITICIA [PA_PRO_CONSULTA_CREDITICIA]')
        } catch (error) {
            this.sendEventLog(AcctionType.ERROR_CONSULTA_CREDITICIA, solicitudKyCModel.id_Solicitud, date, solicitudKyCModel.usuario, 'ERROR [PA_PRO_CONSULTA_CREDITICIA]')
            this.logger.error(`ERROR AL EJECUTAR  [ PA_PRO_CONSULTA_CREDITICIA ]: ${JSON.stringify({ error })}`);
            throw new Error('ERROR AL PROCESAR LA OFERTA CREDITICIA')
        }

    }

    private matchObjectResponse(productos: PRODUCTO[]): Escenarios[] {
        const response: Escenarios[] = [...productos];
        return response;

    }
}