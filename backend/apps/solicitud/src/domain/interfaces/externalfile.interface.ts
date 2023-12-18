/* eslint-disable prettier/prettier */
import { UploadDocumentDto } from 'apps/solicitud/src/application/dtos/uploadfile.dto';

export interface IExternalFilesUseCases {
  execute(uploadDocumentDto: UploadDocumentDto): Promise<void>;
}
