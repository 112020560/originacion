/* eslint-disable prettier/prettier */
import { IncodeProviderInterfaceService } from '@app/infrastructure/api/incode/interfaces/incodeprovider.interface';
import { ImagesReq } from '@app/infrastructure/api/incode/models/incode.request';
import { ISolicitudDocumentoRepository } from '@app/infrastructure/f2pglobal/interfaces/documentos.interface.repository';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { LinkSolicitudRepository } from '@app/infrastructure/mongodb/repositories/linksolicitud.repository';
import { FileServiceInterface } from '@app/infrastructure/storage/interfaces/fileservice.interface';
import { ProcessIncodeDto } from '@app/shared/contracts/incode.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { join } from 'path';
import { IIncodeFilesService } from '../domain/interfaces/incodefile.interface';
import { FilesModel } from '../domain/models/files.model';
import { ServicesEventExtension } from './abstract/services.abstract';

@Injectable()
export class IncodeFilesService extends ServicesEventExtension implements IIncodeFilesService {
    private readonly logger = new Logger(IncodeFilesService.name);
    constructor(
        @Inject('IncodeProviderInterfaceService')
        private readonly IncodeProvider: IncodeProviderInterfaceService,
        @Inject('FolioInterfaceRepository')
        readonly folioRepository: FolioInterfaceRepository,
        @Inject('CORE_SERVICE')
        readonly clientProxyRMQ: ClientProxy,
        @Inject('FileServiceInterface')
        private readonly storageService: FileServiceInterface,
        @Inject('ISolicitudDocumentoRepository')
        private readonly solicitudDocumentoRepository: ISolicitudDocumentoRepository

    ) {
        super(folioRepository, clientProxyRMQ);
    }

    getIncodeFiles = async (dto: ProcessIncodeDto): Promise<boolean> => {
        try {
            const id_solicitud = dto.id_Solicitud;
            this.logger.log(`Solicitud: ${id_solicitud} Descargando Documentos desde INCODE`)
            //MANDAMOS A DESCARGAR LAS IMAGENES DESDE INCODE
            const immageRequest: ImagesReq = {
                images: this.listaImagenes(dto.flujo ?? 'biometric')
            }

            const incodeImagesResponse = await this.IncodeProvider.getImagesAsync({
                oauthPayload: {
                    countryCode: "ALL",
                    interviewId: dto.id_Sesion_Digital
                },
                payload: {
                    Id_Sesion: dto.id_Sesion_Digital,
                    ImagesReq: immageRequest
                }
            });
            //CONSULTAMOS SOLO UNA VES LOS ARCHIVOS QUE YA SE ENCUENTAN REGISTRADOS EN BD
            const registerFiles = await this.solicitudDocumentoRepository.findAll({ where: { fkMtrSolicitud: { id: id_solicitud } } })
            //VALIDAMOS QUE EL OBJETO VENGA CREADO
            if (incodeImagesResponse) {
                const files: FilesModel[] = [];
                //RECORREMOS EL OBJETO DE RESPUESTA PARA DESCARGAR LAS IMAGENES QUE TRAE
                (Object.keys(incodeImagesResponse) as (keyof typeof incodeImagesResponse)[]).forEach((key, index) => {
                    files.push({
                        type: key.replace('_prevAttempts', ''),
                        filename: `${key.replace('_prevAttempts', '')}.jpg`,
                        fileContent: incodeImagesResponse[key]
                    })
                });
                this.logger.log(`Solicitud: ${id_solicitud} - Se van a guardar: ${files.length} archivos en el blob`);
                if (files.length > 0) {

                    for (let index = 0; index < files.length; index++) {
                        const file = files[index];
                        if (file.fileContent != null && file.fileContent != undefined) {
                            this.logger.debug(`Procesando archivo: ${file.filename}`);
                            const currentDate = new Date();
                            const curretYear = currentDate.getFullYear();
                            const currentMonth = currentDate.getMonth() + 1;
                            const fullFilename = join(curretYear.toString(), currentMonth.toString(), id_solicitud.toString(), "Documentos", file.filename);
                            this.logger.debug(`Solicitud: ${id_solicitud} - Ruta de archivo: ${fullFilename} para guardar en blob`);
                            //GUARDAMOS EL ARCHIVO EN EL BLOB
                            await this.storageService.uploadFile(fullFilename, Buffer.from(file.fileContent, 'base64'));
                            this.logger.debug(`Solicitud: ${id_solicitud} - Archivo: ${fullFilename} guardado en blob`);
                            //VALIDAMOS QUE NO EXISTA
                            if (!registerFiles.find(x => x.tipoDocumento == file.type && x.nombreDocumento == file.filename)) {
                                //GUARDAMOS EL REGISTRO DEL ARCHIVO ENVIADO
                                await this.solicitudDocumentoRepository.save({
                                    estadoDocuemnto: 'CARGADO',
                                    fechaIngresoDocumento: dto.fechaLocal,
                                    fkMtrSolicitud: { id: id_solicitud },
                                    header: 'image/png',//data.contentType,
                                    nombreDocumento: file.filename,
                                    rutaDocumento: fullFilename,
                                    tipoDocumento: file.type,
                                    usuario: dto.usuario
                                });
                            } else {
                                this.logger.warn(`Solicitud ${id_solicitud} - El archivo ${file.filename} ya existe`)
                            }
                        } else {
                            this.logger.warn(`Solicitud: ${id_solicitud} - La imagen ${file.filename} no trae contenido`)
                        }
                    }//FINALIZA FOR
                    this.logger.log(`Solicitud: ${id_solicitud} - Imagenes descargadas correctamente`);
                    //ENVIAMOS A REGISTRAR EL LOG
                    this.sendEventLog(AcctionType.DESCARGA_DOCUMENTOS_INCODE, id_solicitud, dto.fechaLocal, dto.usuario,
                        `DESCARGA DE ARCHIVOS ${immageRequest.images.join(', ')} DESDE INCODE`);
                    //TODO::ENVIAR NOTIFICACION VIA SOCKET
                    return true;
                } else {
                    this.logger.warn(`Solicitud: ${id_solicitud} - La coleccion no trae documentos para descargar`)
                    this.sendEventLog(AcctionType.DESCARGA_DOCUMENTOS_INCODE, id_solicitud, dto.fechaLocal, dto.usuario,
                        `LA COLECCION NO CONTIENE DOCUMENTOS`);
                    return false;
                }

            } else {
                this.logger.error(`Solicitud: ${id_solicitud} - Incode no respondio al intenatr extraer las imagenes`)
                return false;
            }

        } catch (error) {
            this.logger.error(`Solicitud: ${dto.token} - Error al descargar las imagenes desde incode : ${JSON.stringify(error)}`)
            return false;
        }

    }
}
