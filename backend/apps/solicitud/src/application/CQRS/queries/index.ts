/* eslint-disable prettier/prettier */
import { DownloadFileHandler } from './download.query';
import { LogAccionHandler } from './logaccion.query';
import { SolicitudQueryHandler } from './solicitud.query';
import { SolicitudDocumentoHandler } from './solicituddocumento.query';

export const cqrsQueries = [SolicitudQueryHandler, LogAccionHandler, SolicitudDocumentoHandler,DownloadFileHandler];
