/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from "@app/infrastructure/api/incode/interfaces/incodeprovider.interface";
import { FolioInterfaceRepository } from "@app/infrastructure/mongodb/interfaces/folio.interface";
import { INCODE_GET_FILES } from "@app/shared/Const/events.const";
import { ProcessIncodeDto } from "@app/shared/contracts/incode.contract";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { commonIncodeDto } from "../application/dtos";
import { IProcessSignService } from "../domain/interfaces/processsign.interface";
import { IncodeAbstract } from "./abstract/incode.abstract";

@Injectable()
export class ProcessSignService extends IncodeAbstract implements IProcessSignService {

    private readonly logger = new Logger(ProcessSignService.name);

    constructor(
        @Inject('DIGITAL_SERVICE')
        readonly digitalProxy: ClientProxy,
        @Inject('CORE_SERVICE')
        readonly coreProxy: ClientProxy,
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        private readonly amqpConnection: AmqpConnection,
        @Inject('FolioInterfaceRepository')
        private readonly folioRepository: FolioInterfaceRepository
    ) {
        super(coreProxy, digitalProxy);
    }

    processSing = async (dto: commonIncodeDto): Promise<void> => {
        if (!dto.token) throw new Error('Token is required');
        this.logger.log(`Start DocumentId validation Token = ${dto.token}`);
        //PROCESO DE VALIDACION DEL TOKEN
        try {
            const validacionUrl = await this.validateTokenUrl(dto.token, dto.fechaLocal);
            if (validacionUrl && validacionUrl.Validado) {

                //#1 tenemos que buscar el folio para obtener el id de impresion
                const folio = await this.folioRepository.findOneByFilter({ id_request: validacionUrl.Id_Solicitud })
                //VALIDAMOS QUE NO TENGA UN CONTRATO YA FIRMADO
                if(folio.subStatus == 'CONTRATO FIRMADO') throw (`Solicitud ${folio.id_request} ya tiene contrato firmado`);
                //MANDAMOS A DESCARGAR LAS IMAGENES INVOLUCRADAS EN EL PROCESO DE FIRMA
                const singContract: ProcessIncodeDto = {
                    fechaLocal: dto.fechaLocal,
                    flujo: "sign",
                    id_Sesion_Digital: dto.interviewId,
                    id_Solicitud: validacionUrl.Id_Solicitud,
                    informacion:
                    {
                        Flujo: dto.flujo,
                        Estado: "Finalizado"
                    },
                    token: dto.token,
                    usuario: validacionUrl.Usuario_Solicitud
                }
                this.sendIncodeProcess(INCODE_GET_FILES, singContract)

                //PUBLICAMOS EL MENSAJE PARA QUE SE TERMINE EL PROCESO DE FIRMA
                if (folio.externalId) {
                    //#2 si existe el folio debemos obtener al sesion de Incode
                    const response = await this.IncodeProvider.startSessionAsync({
                        countryCode: "ALL",
                        interviewId: dto.interviewId
                    });
                    if (response) {
                        //#3 Enviamos al servicio de impresion para que firme los documentos
                        const signedObject = {
                            token: response.token,
                            Id_impresion: folio.externalId,
                            Id_Solicitud: validacionUrl.Id_Solicitud,
                            Usuario: validacionUrl.Usuario_Solicitud,
                            Fecha: dto.fechaLocal,
                            IsApp: false,
                        }
                        this.logger.debug(signedObject);
                        this.amqpConnection.publish("sign.events", "*.documents", signedObject)
                        //TODO::Notificar via socket
                        //CAMBIAMOS EL ESTADO DE LA SOLICITUD
                        this.updateStatus(validacionUrl.Id_Solicitud, new Date(dto.fechaLocal), validacionUrl.Usuario_Solicitud, "SIGNED")
                    } else {
                        throw ('No fue posible iniciar sesion en INCODE');
                    }

                } else {
                    throw ('No se puede completar la firma ya que no existe el folio en impresion')
                }
            } else {
                throw (`${validacionUrl.Mensaje}`)
            }
        } catch (error: any) {
            this.logger.error(error);
            throw Error(`No fue posible termianr el proceso de firma: ${error}`)
        }

    }

}