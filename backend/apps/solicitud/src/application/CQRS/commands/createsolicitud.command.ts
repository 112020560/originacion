/* eslint-disable prettier/prettier */
import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreateSolicitudDto } from '../../dtos/createsolicitud.dto';
import { RespuestaSolicitudDto } from 'apps/solicitud/src/domain/models/createsolicitud.model';
import { Response } from 'apps/solicitud/src/domain/wrappers/response';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { MtrSolicitud } from '@app/infrastructure/f2pglobal/entities/MtrSolicitud.entity';
import { SolicitudRepository } from '@app/infrastructure/f2pglobal/repositories/solicitud.repository';
import { Inject, Logger } from '@nestjs/common';
import { FolioInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/folio.interface';
import { ClientProxy } from '@nestjs/microservices';
import { EventLogContract } from '@app/shared/contracts/eventlog.contract';
import { AcctionType } from '@app/shared/enums/eventlog.enum';
import { EVENT_LOG } from '@app/shared/Const/events.const';

export class CreateSolicitudCommand implements ICommand {
    
    constructor(public readonly createSolicitudDto: CreateSolicitudDto) { }
}

@CommandHandler(CreateSolicitudCommand)
export class CreateSolicitudHandler implements ICommandHandler<CreateSolicitudCommand, Response<RespuestaSolicitudDto>>{

    private readonly logger = new Logger(CreateSolicitudHandler.name);
    constructor(
        private readonly solicitudRepository: SolicitudRepository,
        @Inject('FolioInterfaceRepository')
        private readonly folioRepository: FolioInterfaceRepository,
        @Inject('CORE_SERVICE')
        private readonly coreProxy: ClientProxy
        ) { }
    async execute(command: CreateSolicitudCommand): Promise<Response<RespuestaSolicitudDto>> {

        console.log(command.createSolicitudDto.fechaLocal);
        console.log('Date =>', new Date(command.createSolicitudDto.fechaLocal * 1000));
        const date = new Date(command.createSolicitudDto.fechaLocal * 1000);

        this.logger.log('INSERTANDO NUEVA SOLICITUD EN F2P_GLOBAL')
        
        //CREAMOS LA SOLICITUD EN EL SQL
        const entity: MtrSolicitud = {
           
            correo: command.createSolicitudDto.correoElectronico,
            fechaCreacion: date,
            fechaModificacion: null,
            fechaSolicitud: date,
            fkEstadoSolicitud: command.createSolicitudDto.estado,
            fkSubestadoSolicitud: command.createSolicitudDto.subEstado,
            fkPais: command.createSolicitudDto.pais,
            identificador: command.createSolicitudDto.curp,
            propietario: command.createSolicitudDto.propietario,
            supervisor: command.createSolicitudDto.supervisor,
            usuarioCreacion: command.createSolicitudDto.usuario,
            numRfc: command.createSolicitudDto.rfc,
            telefono: command.createSolicitudDto.telefonoPrincipal,
            nombre: null,
            usuarioModificacion: null,
            identificadorExterno: null,
        }
        const insertData = await this.solicitudRepository.save(entity);

        const event: EventLogContract = {
            AcctionType: AcctionType.INICIO_SOLICITUD,
            FechaLocal: date,
            Id_Solicitud: entity.id,
            Usuario: command.createSolicitudDto.usuario,
            Observacion: 'INICIO NUEVA SOLICITUD'
        }

        this.coreProxy.emit(EVENT_LOG, event);


        this.logger.log(`INSERTANDO NUEVA SOLICITUD EN MOGODN ID_REQUEST ${insertData.id}`)

        //CREAMOS EL REGISTRO EN MONGO DB
        await this.folioRepository.create({
            id_request: insertData.id,
            country: insertData.fkPais,
            accountBank: null,
            bank: null,
            buro: null,
            createDate: date,
            requestDate: date,
            unixRequestDate: command.createSolicitudDto.fechaLocal,
            digitalSesion: null,
            externalId: null,
            flujoDigital: null,
            status: 'ACTIVA',
            subStatus: 'LLENADO DATOS PERSONALES',
            owner: command.createSolicitudDto.propietario,
            supervisor: command.createSolicitudDto.supervisor,
            userCreate:command.createSolicitudDto.usuario,
            kyc: null,
            updateDate: null,
            userUpdate: null,
            offer: null,
            flowSteps: [
                {
                    flow: 'ORIGINACION',
                    steps: [
                        {
                            step: 'LLENADO-DATOS',
                            description: 'Llenado de informacion',
                            status: 'Iniciado',
                            beginDate: date,
                            duration: 0,
                            endDate:null
                        }
                    ]
                }
            ]
        })
        return {
            Success: true,
            Data: {
                Id: insertData.id
            }
        };
    }


    /**
       *Metodo encargado de transforma el Dto en Entidad
       *
       * @private
       * @param {ApplicationDto} applicationDto
       * @return {*}  {Application}
       * @memberof ApplicationRepository
       */
    private toModel(applicationDto: CreateSolicitudDto): MtrSolicitud {
        const data = instanceToPlain(applicationDto);
        return plainToClass(MtrSolicitud, data);
    }
}