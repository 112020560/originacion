/* eslint-disable prettier/prettier */
import { AceptOfferHandler } from './aceptoffer.commad';
import { CreateSolicitudHandler } from './createsolicitud.command';
import { CreateLinkCommandHandler } from './createurl.command';
import { GenerateOtpHandler } from './generateotp.command';
import { OneFlowHandler } from './oneflow.command';
import { TwoFlowHandler } from './twoflow.command';
import { UpdateOwnerHandler } from './updateowner.command';
import { UploadExternalFileHandler } from './uploadfile.command';

export const cqrsCommands = [
    CreateSolicitudHandler,
    UpdateOwnerHandler,
    UploadExternalFileHandler,
    OneFlowHandler,
    TwoFlowHandler,
    GenerateOtpHandler,
    AceptOfferHandler,
    CreateLinkCommandHandler];
