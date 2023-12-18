/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UploadDocumentDto } from '../../application/dtos/uploadfile.dto';
import { join } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FileServiceInterface } from '@app/infrastructure/storage/interfaces/fileservice.interface';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { Folio } from '@app/infrastructure/mongodb/entities/folio.entity';
import { IExternalFilesUseCases, IInsertSaleUseCases } from '../interfaces';
import { ILinkService } from '../../services/interfaces/link.interface';
import { IEventDriveService, IGlobalDbService } from '../../services/interfaces'


@Injectable()
export class ExternalFilesUseCases implements IExternalFilesUseCases {
    private readonly logger = new Logger(ExternalFilesUseCases.name);
    constructor(
        @Inject('FolioInterfaceRepository') 
        readonly folioRepository: FolioInterfaceRepository,
        @Inject('FileServiceInterface') 
        readonly fileServiceService: FileServiceInterface,
        @Inject('IInsertSaleUseCases') 
        private readonly salesService: IInsertSaleUseCases,
        @Inject('ILinkService')
        private readonly linkService: ILinkService,
        @Inject('IGlobalDbService')
        private readonly globalService: IGlobalDbService,
        @Inject('IEventDriveService')
        private readonly eventDriveService: IEventDriveService
    ) { }

    async execute(uploadDocumentDto: UploadDocumentDto): Promise<void> {
        if (uploadDocumentDto.token == '' && uploadDocumentDto.id_Solicitud != 0) {
            this.logger.log('=> uploadDocument');
            await this.uploadDocument(uploadDocumentDto);
        } else {
            this.logger.log('=> externalDocumentProcess');
            await this.externalDocumentProcess(uploadDocumentDto);
        }
    }

    private async externalDocumentProcess(uploadDocumentDto: UploadDocumentDto) {

        ///AQUI SE VALIDA SI LA URL ES VALIDA
        const validacionUrl = await this.linkService.validateLink(uploadDocumentDto.token, uploadDocumentDto.fechaLocal);
        if (validacionUrl.Validado) {
            const id_solicitud = validacionUrl.Id_Solicitud;
            const userName = validacionUrl.Usuario_Solicitud;
            const currentDate = new Date(uploadDocumentDto.fechaLocal);
            //MAPEO DE DATOS QUE EXISTEN EN EL REGISTRO DEL LINK
            uploadDocumentDto.id_Solicitud = validacionUrl.Id_Solicitud;
            uploadDocumentDto.usuario = validacionUrl.Usuario_Solicitud;
            //CONSULTAMOS LA SOLICITUD QUE ESTE ACTIVA
            const solicitudRecord: Folio = await this.folioRepository.findOneByFilter({ id_request: validacionUrl.Id_Solicitud, status: 'ACTIVA' });
            if (solicitudRecord) {
                //SI EXITE EL OBJETO DOCUMENTO, SUBIMOS EL DOCUMENTO AL BLOB STORAGE
                if (uploadDocumentDto.documento) {
                    await this.uploadDocument(uploadDocumentDto);
                }
                //VALIDAMOS EL TIPO DE ACCION PARA TOMAR DECICION DE QUE SE HACE
                if (uploadDocumentDto.tipo && (uploadDocumentDto.tipo == 'interbank' || uploadDocumentDto.tipo == 'estado-cuenta')) {
                    //TODO notificacion al banco transaccion de un centavo

                    //SI NO EXISTE LA CREAMOS EL REGISTRO DE LA CUENTA BANCARIA
                    if (!solicitudRecord.accountBank) {
                       
                        await this.globalService.addorUpdateAccountBank('INSERT', id_solicitud,uploadDocumentDto.cuenta.cuentaInterbancaria,uploadDocumentDto.cuenta.codigoBanco.toString(), userName, currentDate);
                    } else {
                        
                        await this.globalService.addorUpdateAccountBank('UPDATE', id_solicitud,uploadDocumentDto.cuenta.cuentaInterbancaria,uploadDocumentDto.cuenta.codigoBanco.toString(), userName, currentDate); 
                    }
                    //LLAMAMOS AL INGRESAVENTA
                    try {
                        if (solicitudRecord.offer.length > 0) {
                            //INGRESAMOS LA VENTAS
                            //console.log(solicitudRecord.offer.pop())
                            const offer = solicitudRecord.offer.slice(-1)[0];
                            await this.salesService.createSales({
                                CICLO: offer.Ciclo,
                                CUOTA: offer.Cuota,
                                ID_PRODUCTO: offer.Producto.toString(),
                                Id_Solicitud: solicitudRecord.id_request.toString(),
                                PK_PSE_CAT_PROMOCION_PLAZO: offer.Promocion_Plazo,
                                PLAZO: offer.Plazo,
                                FechaLocal: uploadDocumentDto.fechaLocal,
                                LIMITE_CREDITO: offer.Limite_Credito,
                                MONTO_VENTA: offer.Monto_venta,
                                Usuario: uploadDocumentDto.usuario
                            })
                            //SE ACTUALIZA EL ESTADO DEL LINK PARA QUE NO SE VUELVA A USAR
                            // await this.linkUseCases.updateStatusLinkAsync(uploadDocumentDto.token, 'COMPLETADO', "Tu proceso digital ya fue completado.")
                            //TODO:: NOTIFICAR VIA SOCKET QUE YA SE INGRESO LA VENTA
                        } else {
                            //SIN OFERTA CREDITICIA NO SE PUEDE INGRESAR LA VENTAS
                            throw ('No hay ofertas para crear el ingreso de venta')
                        }
                    } catch (error: any) {
                        this.logger.error(error.message)
                        throw Error(error.message);
                    }



                } else {
                    //TODO Enviar por socket la notificacion 
                }
                //Else solicitudRecord    
            } else {
                throw new HttpException(`La solicitud ${validacionUrl.Id_Solicitud} se encuentra en estado ${solicitudRecord.status}`, HttpStatus.CONFLICT);
            }
        } else {
            throw Error(validacionUrl.Mensaje)
        }
    }

    private async uploadDocument(uploadDocumentDto: UploadDocumentDto) {
        const fileSubstrings: string[] = uploadDocumentDto.documento.contenidoDocumento.split(',');
        let header = '';
        let content = '';
        if (fileSubstrings.length > 1) {
            header = fileSubstrings[0].replace("data:", "").replace(";base64", "");
            content = fileSubstrings[1];
        } else {
            content = uploadDocumentDto.documento.contenidoDocumento;
            header = uploadDocumentDto.documento.tipoDocumento;
        }
        const currentDate = new Date();
        const filePath = join(currentDate.getFullYear().toString(), (currentDate.getMonth() + 1).toString(), 'documentos', uploadDocumentDto.documento.nombreDocumento);
        const fileContent = Buffer.from(content, 'base64');

        await this.fileServiceService.uploadFile(filePath, fileContent);

        // const notificationDocument = {
        //     FK_MTR_SOLICITUD: uploadDocumentDto.id_Solicitud,
        //     NOMBRE_DOCUMENTO: uploadDocumentDto.documento.nombreDocumento,
        //     RUTA_DOCUMENTO: filePath,
        //     ESTADO_DOCUEMNTO: 'CARGADO',
        //     FECHA_INGRESO_DOCUMENTO: uploadDocumentDto.fechaLocal,
        //     TIPO_DOCUMENTO: uploadDocumentDto.tipo,
        //     USUARIO: uploadDocumentDto.usuario,
        //     HEADER: header
        // }

        // this.client.emit('solicitud-documento', notificationDocument);
        this.eventDriveService.registerDocument(uploadDocumentDto.id_Solicitud,
                                                uploadDocumentDto.documento.nombreDocumento,
                                                filePath,
                                                header,
                                                uploadDocumentDto.tipo,
                                                uploadDocumentDto.fechaLocal,
                                                uploadDocumentDto.usuario)
    }
}
