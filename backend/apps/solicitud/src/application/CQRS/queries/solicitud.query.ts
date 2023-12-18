/* eslint-disable prettier/prettier */
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SolicitudModel } from 'apps/solicitud/src/domain/models/solicitud.model';
import { ConsultParamsDto } from '../../dtos/queries.params.dto';
import { Response } from 'apps/solicitud/src/domain/wrappers/response';
import { SolicitudRepository } from '@app/infrastructure/f2pglobal/repositories/solicitud.repository';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { MtrSolicitud } from '@app/infrastructure/f2pglobal/entities/MtrSolicitud.entity';
import { Logger } from '@nestjs/common';

export class SolicitudQuery implements IQuery {
    constructor(public readonly consultDto: ConsultParamsDto) { }
}

@QueryHandler(SolicitudQuery)
export class SolicitudQueryHandler implements IQueryHandler<SolicitudQuery, Response<SolicitudModel[]>> {

    constructor(private readonly solicitudRepository: SolicitudRepository) { }

    async execute(query: SolicitudQuery): Promise<Response<SolicitudModel[]>> {

        Logger.log('SolicitudQueryHandler', query.consultDto);



        let filter: FindManyOptions<MtrSolicitud> = {};
        if (query.consultDto.take > 0 && query.consultDto.page > 0) {
            console.log('Con paginacion');
            const take = query.consultDto.take || 10
            const page = query.consultDto.page || 1;
            const skip = (page - 1) * take;
            filter = {
                where: this.generateFilter(query.consultDto),
                relations: { fkEstadoSolicitud2: true, fkSubestadoSolicitud2: true },
                order: { id: 'DESC' },
                take: take,
                skip: skip
            }
        } else {
            console.log('Sin paginacion');
            filter = {
                where: this.generateFilter(query.consultDto),
                relations: { fkEstadoSolicitud2: true, fkSubestadoSolicitud2: true },
                order: { id: 'DESC' }
            }
        }

        Logger.log('filter', filter);

        const dataResponse = await this.solicitudRepository.findAll(filter)
        const model: SolicitudModel[] = [];

        dataResponse.forEach(element => {
            model.push({
                Id: element.id,
                Id_Estado: element.fkEstadoSolicitud,
                Estado: element.fkEstadoSolicitud2.estado,
                Id_SubEstado: element.fkEstadoSolicitud,
                SubEstado: element.fkSubestadoSolicitud2.subEstado,
                Curp: element.identificador ?? 'SIN REFERENCIA',
                Rfc: element.numRfc ?? 'SIN REFERENCIA',
                NombreCompleto: element.nombre ?? 'SIN REFERENCIA',
                TelefonoPrincipal: element.telefono ?? 'SIN REFERENCIA',
                CorreoElectronico: element.correo ?? 'SIN REFERENCIA',
                Propietario: element.propietario,
                FechaSolicitud: Math.floor(element.fechaSolicitud.getTime() / 1000),
                UltimaModificacion: element.fechaModificacion != null ? element.fechaModificacion.toISOString() : '1900-01-01',
                Supervisor: element.supervisor
            })
        });

        return {
            Success: true,
            Message: 'Consulta de solicitudes',
            Errors: null,
            Data: model
        };
    }

    private generateFilter(consultDto: ConsultParamsDto): FindOptionsWhere<MtrSolicitud> {
        // let filter: FindOneOptions<MtrSolicitud> = {
        //     where: { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais },
        //     relations: { fkEstadoSolicitud2: true, fkSubestadoSolicitud2: true }
        // }
        //CONSULTA ORIGINAL CON SUBESTADO
        if (consultDto.SubEstado != 0 && consultDto.Propietario == undefined && consultDto.Supervisor == undefined) {
            Logger.log('CONSULTA ORIGINAL CON SUBESTADO');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais, fkSubestadoSolicitud: consultDto.SubEstado }
        }

        //CONSULTA ORIGINAL CON SUBESTADO Y PROPIETARIO
        else if (consultDto.Propietario != undefined && consultDto.SubEstado != 0) {
            Logger.log('CONSULTA ORIGINAL CON SUBESTADO Y PROPIETARIO');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais, fkSubestadoSolicitud: consultDto.SubEstado, propietario: consultDto.Propietario }
        } else if (consultDto.Propietario != undefined && consultDto.SubEstado == 0) {
            //CONSULTA ORIGINAL CON  PROPIETARIO
            Logger.log('CONSULTA ORIGINAL CON  PROPIETARIO');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais, propietario: consultDto.Propietario }
        }

        //CONSULTA ORIGINAL CON SUBESTADO Y SUPERVISOR
        else if (consultDto.Supervisor != undefined && consultDto.SubEstado != 0) {
            Logger.log('CONSULTA ORIGINAL CON SUBESTADO Y SUPERVISOR');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais, fkSubestadoSolicitud: consultDto.SubEstado, supervisor: consultDto.Supervisor }
        } else if (consultDto.Supervisor != undefined && consultDto.SubEstado == 0) {
            //CONSULTA ORIGINAL CON  SUPERVISOR
            Logger.log('CONSULTA ORIGINAL CON  SUPERVISOR');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais, supervisor: consultDto.Supervisor }
        }
        else {
            Logger.log('CONSULTA ORIGINAL');
            return { fkEstadoSolicitud: consultDto.Estado, fkPais: consultDto.Pais }
        }
    }
}
