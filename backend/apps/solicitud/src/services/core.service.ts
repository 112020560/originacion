/* eslint-disable prettier/prettier */
import { BackendInterfaceService } from "@app/infrastructure/api/backend/interfaces/backend.interface";
import { BackendParam } from "@app/infrastructure/api/backend/models/backend.params";
import { IncodeOcrDataResponse } from "@app/infrastructure/api/incode/models/ocrdata.response";
import { Folio } from "@app/infrastructure/mongodb/entities/folio.entity";
import { Offer } from "@app/infrastructure/mongodb/entities/partial-entities/offer.entity";
import { BackendDataBase, BackendRequestType, DataBaseEngine } from "@app/shared/enums/backendmethod.enum";
import { AcctionType } from "@app/shared/enums/eventlog.enum";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ImpresionResponse } from "../domain/models/impresion.model";
import { IngresaVentaResponse } from "../domain/models/ingresaventaresponse.model";
import { IngresaVentaModel } from "../domain/models/salescreate.model";
import { TagDto } from "../domain/models/tags.model";
import { PlantillaSmsResponse } from "../domain/models/template.model";
import { ICoreService } from "./interfaces/core.interface";
import { IEventDriveService } from "./interfaces/eventdrive.interface";

@Injectable()
export class CoreService implements ICoreService {
    private readonly logger = new Logger(CoreService.name);
    constructor(
        @Inject('BackendInterfaceService')
        private readonly backendRepository: BackendInterfaceService,
        @Inject('IEventDriveService')
        private readonly eventService: IEventDriveService
    ) { }

    public insertCoreSale = async (folio: Folio, ingresaVentaModel: IngresaVentaModel): Promise<IngresaVentaResponse> => {
        const id_solicitud = Number(ingresaVentaModel.Id_Solicitud);
        const date = new Date(ingresaVentaModel.FechaLocal);
        const userName = ingresaVentaModel.Usuario;

        const backendParams = await this.createBackendParanetrs(folio, ingresaVentaModel);
        //INGRESAMOS LA VENTA
        try {
            this.logger.debug(`Solicitud [${id_solicitud}] - EJECUTANDO PA_PRO_INGRESA_VENTA`)
            const ingresaVentaResponse: IngresaVentaResponse = await this.backendRepository.sendBackendRequest<IngresaVentaResponse>(
                {
                    ApplicationId: 'ventas-mx',
                    Columns: [],
                    Country: 'MX',
                    DataBase: BackendDataBase.F2P_VENTAS,
                    Engine: DataBaseEngine.MSSQL,
                    Flag: 0,
                    Metodo: BackendRequestType.GET,
                    Params: backendParams,
                    Procedimiento: 'PA_PRO_INGRESA_VENTA',
                }
            );
            //SE ENVIA LA NOTIFICACION DE QUE SE INGRESO LA VENTA
            this.eventService.sendEventLog(AcctionType.INGRESA_VENTA, id_solicitud, date, userName, `Venta ingresada. Cola de revicion: ${ingresaVentaResponse.outvalues.IDCOLA_REV_OUT}`);
            this.logger.debug(`Solicitud [${id_solicitud}] - PA_PRO_INGRESA_VENTA EJECUTADO CORRECTAMENTE`)
            //RESPUESTA DEL PROCEDIMIENTO
            return ingresaVentaResponse;
        } catch (error) {
            const errorMessage = `Solicitud [${id_solicitud}] - Error al ejecutar PA_PRO_INGRESA_VENTA: ${error.message}`;
            this.logger.error(errorMessage);
            //LOG EVENTOS
            this.eventService.sendEventLog(AcctionType.ERR_IN_VTA, id_solicitud, date, userName, `errorMessage`);
            //CAMBIO DE ESTADO
            this.eventService.sendUpdateStatus(id_solicitud, date, userName, 'ERR_IN_VTA');
            throw Error(errorMessage);
        }
    }

    public approveCoreSale = async (id_cola_revision: number, ingresaVentaModel: IngresaVentaModel): Promise<Array<ImpresionResponse>> => {
        const id_solicitud = Number(ingresaVentaModel.Id_Solicitud);
        const date = new Date(ingresaVentaModel.FechaLocal);
        const userName = ingresaVentaModel.Usuario;

        try {
            this.logger.debug(`Solicitud [${id_solicitud}] - EJECUTANDO PA_PRO_APROBACION_AUTOMATICA_REVAMP`)
            const impresiomResponse: Array<ImpresionResponse> = await this.backendRepository.sendBackendRequest<Array<ImpresionResponse>>(
                {
                    ApplicationId: 'ventas-mx',
                    Columns: [],
                    Country: 'MX',
                    DataBase: BackendDataBase.F2P_VENTAS,
                    Engine: DataBaseEngine.MSSQL,
                    Flag: 0,
                    Metodo: BackendRequestType.GET,
                    Params: [
                        { Parametro: 'P_ID_COLA_REVISION', Valor: id_cola_revision },
                        { Parametro: "P_STATUS", Valor: "2100" },
                        { Parametro: "P_FLUJO_ACTUAL", Valor: "Normal" },
                        { Parametro: "P_USUARIO", Valor: userName.substring(0, 20) }
                    ],
                    Procedimiento: 'PA_PRO_APROBACION_AUTOMATICA_REVAMP',
                });
            //LOG DE EVENTOS DE LA SOLICITUD
            this.eventService.sendEventLog(AcctionType.INGRESA_VENTA, id_solicitud, date, userName, 'VENTA INGRESADA Y APROBADA');

            this.logger.debug(`Solicitud [${id_solicitud}] - PA_PRO_APROBACION_AUTOMATICA_REVAMP EJECUTADO CORRECTAMENTE`)

            return impresiomResponse;
        } catch (error) {
            const errorMessage = `Solicitud [${id_solicitud}] - Error Ejecutando procedimiento PA_PRO_APROBACION_AUTOMATICA_REVAMP: ${JSON.stringify({ error })}`;
            this.logger.error(errorMessage);
            //LOG EVENTOS
            this.eventService.sendEventLog(AcctionType.ERR_IN_VTA, id_solicitud, date, userName, errorMessage);
            //CAMBIO DE ESTADO
            this.eventService.sendUpdateStatus(id_solicitud, date, userName, 'ERR_APRB');
            throw Error(errorMessage);
        }
    }

    public getTamplete = async (digiltaFlow: string, fullName: string, link: string, offer: Offer): Promise<Array<PlantillaSmsResponse>> => {
        const backendParameter: Array<BackendParam> = [];
        const tags: Array<TagDto> = [];
        if (digiltaFlow == "sign") {
            tags.push({ Tag: "[NOMBRE]", Value: fullName });
            tags.push({ Tag: "[MONTO]", Value: offer.Monto_venta.toString() });
            tags.push({ Tag: "[TASA]", Value: offer.Tasa_Interes.toString() });
            tags.push({ Tag: "[PLAZO]", Value: offer.Plazo.toString() });
            tags.push({ Tag: "[LINK]", Value: link })
            backendParameter.push({ Parametro: 'P_LLAVE', Valor: 'link_incode_contrato' })
            backendParameter.push({ Parametro: 'P_TAGS', Valor: JSON.stringify(tags) })

        } else {
            tags.push({ Tag: "[NOMBRE]", Value: fullName });
            tags.push({ Tag: "[MONTO]", Value: offer.Monto_venta.toString() });
            tags.push({ Tag: "[LINK]", Value: link })
            backendParameter.push({ Parametro: 'P_LLAVE', Valor: 'link_incode_indentidad' })
            backendParameter.push({ Parametro: 'P_TAGS', Valor: JSON.stringify(tags) })
        }

        const respPlantilla = await this.backendRepository.sendBackendRequest<PlantillaSmsResponse[]>({
            ApplicationId: 'ventas-mx',
            Country: 'MX',
            DataBase: BackendDataBase.CORE,
            Engine: DataBaseEngine.MSSQL,
            Flag: 0,
            Params: backendParameter,
            Metodo: BackendRequestType.GET,
            Procedimiento: "PA_CON_INFO_PLANTILLA_SMS",
            Columns: []
        })

        return respPlantilla;

    }

    //METODOS PRIVADOS
    private async createBackendParanetrs(folio: Folio, ingresaVentaModel: IngresaVentaModel): Promise<BackendParam[]> {
        const params: BackendParam[] = [];

        if (folio && folio.kyc) {
            const kyc = folio.kyc;
            //await this.inforKycRepository.findOneByFilter({ where: { Id_Solicitud: Number(ingresaVentaModel.Id_Solicitud) } });
            const sub_origen = 3;   // (1: SOC, 2: SUCURSAL_VIRTUAL, 3: APP)
            const agente = '99';//ingresaVentaModel.Usuario.substring(0, 20);
            const pais = "52";
            //OBTENEMOS LA CUENTA BANCARIA
            const account = folio.accountBank ?? '';
            const banck = folio.bank ?? '1';
            //OBTENEMOS LA OCRDATA
            const incodeData = await this.ObtenerOcrSolicitudAsync(folio);
            //REQUERIMIENTO PARA OBTENER LOS NOMBRES DE LA OCR
            let PRIMER_NOMBRE: string = null;
            let SEGUNDO_NOMBRE: string = null;
            let PRIMER_APELLIDO: string = null;
            let SEGUNDO_APELLIDO: string = null;
            if (incodeData) {
                const names = incodeData.ocrData?.name?.firstName?.split(' ');
                if (names != null && names.length > 1) {
                    PRIMER_NOMBRE = names[0];
                    SEGUNDO_NOMBRE = names[1];
                } else {
                    if (incodeData.ocrData?.name?.firstName != incodeData.ocrData?.name?.givenName) {
                        PRIMER_NOMBRE = incodeData.ocrData?.name?.firstName;
                        SEGUNDO_NOMBRE = incodeData.ocrData?.name?.givenName;
                    }
                    else {
                        PRIMER_NOMBRE = incodeData.ocrData?.name?.firstName;
                        SEGUNDO_NOMBRE = '';
                    }
                }
                PRIMER_APELLIDO = incodeData.ocrData?.name.paternalLastName;
                    SEGUNDO_APELLIDO = incodeData.ocrData?.name.maternalLastName;
            }

            //VALIDACION DE REFERIDOS
            let referido1 = false;
            let referido2 = false;
            if (kyc.informacionPersonal.Referidos != null && kyc.informacionPersonal.Referidos.length > 0) {
                referido1 = true;
                if (kyc.informacionPersonal.Referidos.length > 1) {
                    referido2 = true;
                }
            }

            //SE CREAN LOS PARAMETROS
            params.push({ Parametro: 'PRIMER_NOMBRE', Valor: PRIMER_NOMBRE ?? kyc?.informacionPersonal?.Nombre });
            params.push({ Parametro: "SEGUNDO_NOMBRE", Valor: SEGUNDO_NOMBRE ?? kyc?.informacionPersonal.SegundoNombre });
            params.push({ Parametro: "PRIMER_APELLIDO", Valor: PRIMER_APELLIDO ?? kyc.informacionPersonal.ApellidoPaterno });
            params.push({ Parametro: "SEGUNDO_APELLIDO", Valor: SEGUNDO_APELLIDO ?? kyc.informacionPersonal.ApellidoMaterno });
            params.push({ Parametro: "FECHA_NACIMIENTO", Valor: new Date(kyc.informacionPersonal.FechaNacimiento * 1000) });
            //kyc.Informacion.informacionPersonal.FechaNacimiento });
            params.push({ Parametro: "CIUDAD", Valor: kyc.informacionPersonal.LugarNacimiento });
            params.push({ Parametro: "COLONIA", Valor: kyc.informacionGeografica.Colonia });
            params.push({ Parametro: "NACIONALIDAD", Valor: "Mexico [mexicano]" });
            params.push({ Parametro: "IDENTIFICACION1", Valor: kyc.informacionPersonal.Curp });
            params.push({ Parametro: "IDENTIFICACION2", Valor: kyc.informacionPersonal.Rfc });
            params.push({ Parametro: "IDENTIFICACION3", Valor: incodeData?.ocrData != null ? incodeData?.ocrData.claveDeElector ?? "" : "" });
            params.push({ Parametro: "CANTIDADVEHICULOS", Valor: 0 });
            params.push({ Parametro: "ESTADOCIVIL", Valor: "" });
            params.push({ Parametro: "SEXO", Valor: kyc.informacionPersonal.Genero });
            params.push({ Parametro: "PROFESION", Valor: kyc.informacionPersonal.Profesion });
            params.push({ Parametro: "NUMDEPENDIENTES", Valor: 0 });
            params.push({ Parametro: "GASTOSMENSUALESDEPENDIENTES", Valor: 0 });
            params.push({ Parametro: "EMAIL", Valor: kyc.informacionPersonal.CorreoElectronico });
            params.push({ Parametro: "DTGTELCODRESIDENCIA", Valor: "" });
            params.push({ Parametro: "DTGTELRESIDENCIA", Valor: "" });
            params.push({ Parametro: "DTGTELEXTRESIDENCIA", Valor: "" });
            params.push({ Parametro: "DTGTELCODAREAMOVIL", Valor: "" });
            params.push({ Parametro: "DTGTELMOVIL", Valor: kyc.informacionPersonal.TelefonoCelular });
            params.push({ Parametro: "DTGTELEXTMOVIL", Valor: "" });
            params.push({ Parametro: "DTGTELCODAREAOTRO1", Valor: "" });
            params.push({ Parametro: "DTGTELOTRO1", Valor: kyc.informacionPersonal.OtroTelefono });
            params.push({ Parametro: "DTGTELEXTOTRO1", Valor: "" });
            params.push({ Parametro: "DTGTELCODAREAOTRO2", Valor: "" });
            params.push({ Parametro: "DTGTELOTRO2", Valor: "" });
            params.push({ Parametro: "DTGTELEXTOTRO2", Valor: "" });
            params.push({ Parametro: "DTGTIPOCASA", Valor: "" });
            params.push({ Parametro: "RENTAMENSUAL", Valor: 0 });
            params.push({ Parametro: "NOMBREPAGADORRENTA", Valor: "" });
            params.push({ Parametro: "ANNOCARRO", Valor: "" });
            params.push({ Parametro: "MARCACARRO", Valor: "" });
            params.push({ Parametro: "TIEMPORESIDIR", Valor: 0 });
            params.push({ Parametro: "REFERENCIATARJETACREDITO", Valor: "" });
            params.push({ Parametro: "REFERENCIACUENTACORRIENTE", Valor: "" });
            params.push({ Parametro: "REFERENCIACUENTAAHORRO", Valor: "" });
            params.push({ Parametro: "DOTDREFERENCIAPRESTAMO", Valor: "" });
            params.push({ Parametro: "DOTDMONTOSOLICITADO", Valor: 0 });
            params.push({ Parametro: "DOTDPERIODOPAGO", Valor: 0 });
            params.push({ Parametro: "DOTDDESCRIPCION", Valor: "" });
            params.push({ Parametro: "DLNOMEMPRESA", Valor: kyc.informacionLaboral.Patrono });
            params.push({ Parametro: "DLFECHAINGRESO", Valor: null });
            params.push({ Parametro: "DLEMAIL", Valor: "" });
            params.push({ Parametro: "DLOCUPACION", Valor: kyc.informacionPersonal.Oficio });
            params.push({ Parametro: "DLINGRESOMENSUALB", Valor: kyc.informacionPersonal.IngresoMensualBruto });
            params.push({ Parametro: "DLOTROINGRESO", Valor: 0 });
            params.push({ Parametro: "DLACTIVIDADEMPRESA", Valor: "" });
            params.push({ Parametro: "DLANTIGUEDAD", Valor: 0 });
            params.push({ Parametro: "DLTELOFICINA", Valor: kyc.informacionLaboral.TelefonoTrabajo });
            params.push({ Parametro: "DLTELEXT", Valor: "" });
            params.push({ Parametro: "DLTELFAX", Valor: "" });
            params.push({ Parametro: "DLDEPARTAMENTO", Valor: "" });
            params.push({ Parametro: "DLTIENECARGOPOLITICO", Valor: 0 });
            params.push({ Parametro: "DLCARGOPOLITICO", Valor: "" });
            params.push({ Parametro: "DLPERIODO", Valor: "" });
            params.push({ Parametro: "DLNUMEROEMPLEADOS", Valor: 0 });
            params.push({ Parametro: "DLRETENEDORIVA", Valor: 0 });
            params.push({ Parametro: "DLGIRODELNEGOCIO", Valor: 0 });
            params.push({ Parametro: "DCNOMBRECOMPLETO", Valor: "" });
            params.push({ Parametro: "DCIDENTIFICACION", Valor: "" });
            params.push({ Parametro: "DCESPECIFIQUE", Valor: "" });
            params.push({ Parametro: "DCSEXO", Valor: 0 });
            params.push({ Parametro: "DCINGRESOSMENSUALES", Valor: "" });
            params.push({ Parametro: "DCPROFESION", Valor: "" });
            params.push({ Parametro: "DCTRABAJO", Valor: "" });
            params.push({ Parametro: "DCCARGO", Valor: "" });
            params.push({ Parametro: "DCANTIGUEDAD", Valor: "" });
            params.push({ Parametro: "DCTELCELULAR", Valor: kyc.informacionPersonal.TelefonoCelular });
            params.push({ Parametro: "DCTELOTRO1", Valor: kyc.informacionPersonal.OtroTelefono });
            params.push({ Parametro: "DCTELOFICINA", Valor: kyc.informacionLaboral.TelefonoTrabajo });
            params.push({ Parametro: "DCTELFAX", Valor: "" });
            params.push({ Parametro: "RPREF1NOMBRECOMPLETO", Valor: referido1 ? kyc.informacionPersonal.Referidos[0].Nombre : "" });
            params.push({ Parametro: "RPREF1TELEFONO", Valor: referido1 ? kyc.informacionPersonal.Referidos[0].Telefono : "" });
            params.push({ Parametro: "RPREF1PARENTESCO", Valor: referido1 ? kyc.informacionPersonal.Referidos[0].Parentesco : "" });
            params.push({ Parametro: "RPREF1DIRECCION", Valor: referido1 ? kyc.informacionPersonal.Referidos[0].Direccion : "" });
            params.push({ Parametro: "RPREF2NOMBRECOMPLETO", Valor: referido2 ? kyc.informacionPersonal.Referidos[1].Nombre : "" });
            params.push({ Parametro: "RPREF2TELEFONO", Valor: referido2 ? kyc.informacionPersonal.Referidos[1].Telefono : "" });
            params.push({ Parametro: "RPREF2PARENTESCO", Valor: referido2 ? kyc.informacionPersonal.Referidos[1].Parentesco : "" });
            params.push({ Parametro: "RPREF2DIRECCION", Valor: referido2 ? kyc.informacionPersonal.Referidos[1].Direccion : "" });
            params.push({ Parametro: "KYCDIRCASAPROVINCIA", Valor: kyc.informacionGeografica.Estado });
            params.push({ Parametro: "KYCDIRCASACANTON", Valor: kyc.informacionGeografica.Municipio });
            params.push({ Parametro: "KYCDIRCASADISTRITO", Valor: kyc.informacionGeografica.Colonia });
            params.push({ Parametro: "KYCDIRCASACOLONIA", Valor: kyc.informacionGeografica.Colonia });
            params.push({ Parametro: "KYCDIRCASACIUDAD", Valor: "" });
            params.push({ Parametro: "KYCDIRCASADETALLE", Valor: `${kyc.informacionGeografica.Calle} | ${kyc.informacionGeografica.NumExt} | ${kyc.informacionGeografica.NumInt}` });
            params.push({ Parametro: "KYCDIRTRABAJOPAIS", Valor: "" });
            params.push({ Parametro: "KYCDIRTRABAJOPROVINCIA", Valor: "" });
            params.push({ Parametro: "KYCDIRTRABAJOCANTON", Valor: "" });
            params.push({ Parametro: "KYCDIRTRABAJODISTRITO", Valor: "" });
            params.push({ Parametro: "KYCDIRTRABAJODETALLE", Valor: "" });
            params.push({ Parametro: "KYCDIRMENSAJERIAPAIS", Valor: "" });
            params.push({ Parametro: "KYCDIRMENSAJERIAPROVINCIA", Valor: kyc.informacionGeografica.Estado });
            params.push({ Parametro: "KYCDIRMENSAJERIACANTON", Valor: kyc.informacionGeografica.Municipio });
            params.push({ Parametro: "KYCDIRMENSAJERIADISTRITO", Valor: kyc.informacionGeografica.Colonia });
            params.push({ Parametro: "KYCDIRMENSAJERIADETALLE", Valor: `${kyc.informacionGeografica.Calle} | ${kyc.informacionGeografica.NumExt} | ${kyc.informacionGeografica.NumInt}` });
            params.push({ Parametro: "KYCCORREOPAIS", Valor: "" });
            params.push({ Parametro: "KYCCORREOPROVINCIA", Valor: "" });
            params.push({ Parametro: "KYCCORREOCANTON", Valor: "" });
            params.push({ Parametro: "KYCCORREODISTRITO", Valor: "" });
            params.push({ Parametro: "KYCCORREODETALLE", Valor: "" });
            params.push({ Parametro: "MENFECHAENTREGA", Valor: "" });
            params.push({ Parametro: "MENLUGARENTREGA", Valor: "" });
            params.push({ Parametro: "MENPAISENTREGA", Valor: "" });
            params.push({ Parametro: "MENPROVINCIA", Valor: "" });
            params.push({ Parametro: "MENCANTON", Valor: "" });
            params.push({ Parametro: "MENDISTRITO", Valor: "" });
            params.push({ Parametro: "MENDETALLE", Valor: "" });
            params.push({ Parametro: "MENTELRESIDENCIA", Valor: "" });
            params.push({ Parametro: "MENTELOFICINA", Valor: "" });
            params.push({ Parametro: "MENTELCELULAR", Valor: "" });
            params.push({ Parametro: "MENTELOTRO", Valor: "" });
            params.push({ Parametro: "MENHORARIOENTREGA", Valor: "" });
            params.push({ Parametro: "MENHORADESDE", Valor: "" });
            params.push({ Parametro: "MENHORAHASTA", Valor: "" });
            params.push({ Parametro: "MENCOMENTARIOS", Valor: "" });
            params.push({ Parametro: "MENDOCCEDULA", Valor: "" });
            params.push({ Parametro: "MENDOCRECIBO", Valor: "" });
            params.push({ Parametro: "MENORDENPATRONAL", Valor: "" });
            params.push({ Parametro: "MENCOLILLA", Valor: "" });
            params.push({ Parametro: "MENCODIGOAGENTE", Valor: agente });
            params.push({ Parametro: "MENENTREGADOCUMENTOS", Valor: "" });
            params.push({ Parametro: "DCRMONTOSOLICITADO", Valor: ingresaVentaModel.MONTO_VENTA });
            params.push({ Parametro: "DCRLINEACREDITO", Valor: ingresaVentaModel.LIMITE_CREDITO });
            params.push({ Parametro: "DCRCOUTA", Valor: ingresaVentaModel.CUOTA });
            params.push({ Parametro: "DCRPLAZO", Valor: ingresaVentaModel.PLAZO });
            params.push({ Parametro: "DCRCODPRODUCTONUEV", Valor: ingresaVentaModel.ID_PRODUCTO });
            params.push({ Parametro: "IDPROPOSITO", Valor: 1 });
            params.push({ Parametro: "DCRNOSCONOCE", Valor: 0 });
            params.push({ Parametro: "DCRTELCONTACTO", Valor: "" });
            params.push({ Parametro: "DCRTIPODESEMBOLSO", Valor: "Transferencia" });
            params.push({ Parametro: "DCRBANCO", Valor: "0" });
            params.push({ Parametro: "DCRCUENTASSINPE", Valor: account });
            params.push({ Parametro: "DCRCUENTAINTERNA", Valor: "" });
            params.push({ Parametro: "DCRTIPOTRANSFERENCIA", Valor: "TFTR" });
            params.push({ Parametro: "DCRTIPOVENTA", Valor: "Nuevo" });
            params.push({ Parametro: "DCRCICLO", Valor: ingresaVentaModel.CICLO });
            params.push({ Parametro: "TVTIPOTIENDA", Valor: "" });
            params.push({ Parametro: "TVSUCURSAL", Valor: "" });
            params.push({ Parametro: "TVPAQUETE", Valor: "" });
            params.push({ Parametro: "TVMONTOOTRODESEMBOLSO", Valor: 1 });
            params.push({ Parametro: "TVTIPODESEMBOLSO", Valor: "" });
            params.push({ Parametro: "TVBANCO", Valor: banck });
            params.push({ Parametro: "TVCUENTASINPE", Valor: account });
            params.push({ Parametro: "TVCUENTAINTERNA", Valor: "" });
            params.push({ Parametro: "TVTIPOTRANSFERENCIA", Valor: "" });
            params.push({ Parametro: "MONSALDOCUENTA", Valor: 0 });
            params.push({ Parametro: "PAGAREACTUAL", Valor: "" });
            params.push({ Parametro: "MULTIPLO", Valor: 0 });
            params.push({ Parametro: "BIT_REGALIA", Valor: 0 });
            params.push({ Parametro: "BIT_APLICADEBITO", Valor: ((folio?.accountBank) == null ? 0 : 1) });
            params.push({ Parametro: "INT_PERIODO_DEBITO", Valor: ((folio?.accountBank) == null ? 0 : 3) }); //Hay que verificar como obtener esto
            params.push({ Parametro: "STR_SUBPERIODO_DEBITO", Valor: "" });
            params.push({ Parametro: "STR_CUENTA", Valor: account }); //hay que ver cual es la cuenta nuestra
            params.push({ Parametro: "INT_BANCO", Valor: banck });
            params.push({ Parametro: "DCRCODPRODUCTOACT", Valor: "0" });
            params.push({ Parametro: "NUMEROSOLICITUD", Valor: "0" });
            params.push({ Parametro: "APELLIDOCASADA", Valor: "" });
            params.push({ Parametro: "CNL_IDCANAL", Valor: "0" });
            params.push({ Parametro: "CNL_DESEMBOLSO", Valor: "" });
            params.push({ Parametro: "CNL_IDCOMERCIO", Valor: "" });
            params.push({ Parametro: "CNL_IDSUCURSAL", Valor: "" });
            params.push({ Parametro: "CNL_MONTO", Valor: "" });
            params.push({ Parametro: "CNL_OTROMONTO", Valor: "" });
            params.push({ Parametro: "CNL_OTRODESEMBOLSO", Valor: "" });
            params.push({ Parametro: "POSEEARTICULOS", Valor: "0" });
            params.push({ Parametro: "RPREF3NOMBRECOMPLETO", Valor: "" });
            params.push({ Parametro: "RPREF3TELEFONO", Valor: "" });
            params.push({ Parametro: "RPREF3PARENTESCO", Valor: "" });
            params.push({ Parametro: "RPREF3DIRECCION", Valor: "" });
            params.push({ Parametro: "LUGAREMISIONDUI", Valor: "" });
            params.push({ Parametro: "FECHAEMISIONDUI", Valor: "" });
            params.push({ Parametro: "STR_CODIGO_FORZAMIENTO", Valor: "" });
            params.push({ Parametro: "SIN_TIPO_SOLICITUD", Valor: 0 });
            params.push({ Parametro: "STR_USUARIO", Valor: agente });
            params.push({ Parametro: "SIN_MODO_EJECUCION", Valor: 0 });
            params.push({ Parametro: "SIN_OPCION", Valor: 0 });
            params.push({ Parametro: "STR_IDENTIFICADOR_EXTERNO", Valor: "" });
            params.push({ Parametro: "SIN_APROBACION_DIRECTA", Valor: 0 });
            params.push({ Parametro: "P_FK_PSE_CAT_PROMOCION_PLAZO", Valor: ingresaVentaModel.PK_PSE_CAT_PROMOCION_PLAZO });
            params.push({ Parametro: "MENTEXTOVALIDACIONCAJASOCIAL", Valor: "" });
            params.push({ Parametro: "MENCODIGOOPERADORPENSION", Valor: "" });
            params.push({ Parametro: "INT_SUB_ORIGEN", Valor: sub_origen });
            params.push({ Parametro: "BIN_ID_SOLICITUD_REF", Valor: 0 });
            params.push({ Parametro: "TIPOMONEDA_DEB_AUTOMATICO", Valor: 0 });
            params.push({ Parametro: "TIPOMONEDA_TRANSFERENCIA", Valor: 0 });
            params.push({ Parametro: "INT_ID_MARCA_ASIGNADA", Valor: 0 });
            params.push({ Parametro: "P_FECHA_INICIO_ACTIVIDAD_LABORAL", Valor: "2000-01-01" });
            params.push({ Parametro: "P_RESP_ART15", Valor: 0 });
            params.push({ Parametro: "P_RESP_PEP", Valor: 0 });
            params.push({ Parametro: "P_RESP_PEPConyugue", Valor: 0 });
            params.push({ Parametro: "P_RESP_FATCA", Valor: 0 });
            params.push({ Parametro: "P_TIPO_FORMALIZACION", Valor: 0 });
            params.push({ Parametro: "P_TIPO_CUENTA_IBAN", Valor: 4 });
            params.push({ Parametro: "P_DIRECCION_CIUDAD", Valor: "" });
            params.push({ Parametro: "P_TRABAJO_CIUDAD", Valor: "" });
            params.push({ Parametro: "P_DIRECCION_CODIGO_POSTAL", Valor: kyc.informacionGeografica.CodigoPostal });
            params.push({ Parametro: "P_TRABAJO_CODIGO_POSTAL", Valor: "" });
            params.push({ Parametro: "P_MENSAJERIA_CIUDAD", Valor: "" });
            params.push({ Parametro: "P_MENSAJERIA_CODIGO_POSTAL", Valor: kyc.informacionGeografica.CodigoPostal });
            params.push({ Parametro: "KYCDIRCASAPAIS", Valor: pais });
            params.push({ Parametro: "IDCOLA_REV_OUT", Valor: 0, Direction: 'OUT' });
        } else {
            throw 'No fue posible obtener la informacion para el kyc';
        }

        return params;
    }

    private async ObtenerOcrSolicitudAsync(folio: Folio): Promise<IncodeOcrDataResponse> {

        if (folio && folio.flujoDigital && folio.flujoDigital.length > 0) {
            const ocrRow = folio.flujoDigital.find(d => d.Tipo == 'OCR');
            if (ocrRow) {
                const ocr: IncodeOcrDataResponse = JSON.parse(ocrRow.InformacionFlujo);
                return ocr;
            }
        }
        else {
            return null;
        }
    }
}