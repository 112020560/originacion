/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { LinkSchema, LinksSolicitud } from '../entities/linksolicitud.entity';
import { LinkSolicitudRepository } from "./linksolicitud.repository";
import { MongoFolioRepository } from './folio.repositiry';
import { WorkflowRepository } from './workflow.repository';
import { Folio, FolioSchema } from '../entities/folio.entity';
import { WorkFlowSchema, WorkFlowStep } from '../entities/workflowsteps.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpRepository } from './otp.repository';
import { Otp, OtpSchema } from '../entities/otp.entity';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Folio.name, schema: FolioSchema },
        {name: LinksSolicitud.name, schema: LinkSchema},
        {name: WorkFlowStep.name, schema: WorkFlowSchema},
        {name: Otp.name, schema: OtpSchema},
    ]),],
    //([LinksSolicitud, FlujoDigital, Folio, AceptaOfertaSolicitud, WorkFlowStep])],
    providers: [
        LinkSolicitudRepository,
        //FlujoDigitalRepository,
        //OfertaClienteRepository,
        {
            provide: 'FolioInterfaceRepository',
            useClass: MongoFolioRepository
        },
        {
            provide: 'WorkFlowInterfaceRepository',
            useClass: WorkflowRepository
        },
        {
            provide: 'OtpInterfaceRepository',
            useClass: OtpRepository
        }],
    exports: [
        LinkSolicitudRepository,
        //FlujoDigitalRepository,
        //OfertaClienteRepository,
        {
            provide: 'FolioInterfaceRepository',
            useClass: MongoFolioRepository
        },
        {
            provide: 'WorkFlowInterfaceRepository',
            useClass: WorkflowRepository
        },
        {
            provide: 'OtpInterfaceRepository',
            useClass: OtpRepository
        }]
})
export class RepositoryModule { }