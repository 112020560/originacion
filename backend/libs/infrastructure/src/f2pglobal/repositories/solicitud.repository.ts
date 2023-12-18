/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MtrSolicitud } from '../entities/MtrSolicitud.entity';
import { SolicitudRepositoryInterface } from '../interfaces/solicitud.interface.repository';
import { BaseAbstractRepository } from './base/base.abstract.repository';

@Injectable()
export class SolicitudRepository extends BaseAbstractRepository<MtrSolicitud> implements SolicitudRepositoryInterface {
  constructor(
    @InjectRepository(MtrSolicitud)
    private solicitudRepository: Repository<MtrSolicitud>,
  ) {
    super(solicitudRepository);
  }
  async GetByStatus(estado: number, subestado: number, pais: number): Promise<MtrSolicitud[]> {
    let filter: FindOptionsWhere<MtrSolicitud> = { fkEstadoSolicitud:estado, fkPais: pais };
    if(subestado != 0) {
      filter = {fkEstadoSolicitud:estado, fkPais: pais, fkSubestadoSolicitud: subestado}
    }
    return await this.solicitudRepository.find({where: filter, relations: {fkEstadoSolicitud2: true, fkSubestadoSolicitud2: true}})
  }
  async GetByOwner(estado: number, subestado: number, pais: number, usernam?: string, supervisor?: string): Promise<MtrSolicitud[]> {
    let filter: FindOptionsWhere<MtrSolicitud> = { fkEstadoSolicitud:estado, fkPais: pais };
    if(subestado != 0) {
      filter = {fkEstadoSolicitud:estado, fkPais: pais, fkSubestadoSolicitud: subestado}
    }
    return await this.solicitudRepository.find({where: filter, relations: {fkEstadoSolicitud2: true, fkSubestadoSolicitud2: true}})
  }

  async update(entity: MtrSolicitud): Promise<void> {
    console.log('Entre a Actualizar');
    await this.solicitudRepository.update(entity.id, entity);
  }

  // async GetByStatus(estado: number, subestado: number, pais: number): Promise<SolicitudModel[]> {
  //   const query = this.solicitudRepository.createQueryBuilder('m')
  //     .select(["Id = m.PK_MTR_SOLICITUD",
  //       "Id_Estado = c.PK_ESTADO_SOLICITUD",
  //       "Estado = c.ESTADO",
  //       "Id_SubEstado = x.PK_SUBESTADO_SOLICITUD",
  //       "SubEstado = x.SUB_ESTADO",
  //       "Curp = m.IDENTIFICADOR",
  //       "Rfc = m.NUM_RFC",
  //       "TelefonoPrincipal = m.TELEFONO",
  //       "CorreoElectronico = m.CORREO",
  //       "Propietario = m.PROPIETARIO",
  //       "FechaSolicitud = DATEDIFF(SECOND,'1970-01-01',  m.FECHA_SOLICITUD)",
  //       "UltimaModificacion = m.FECHA_MODIFICACION"
  //     ])
  //     .innerJoin(CatEstadoSolicitud, 'c', 'm.FK_ESTADO_SOLICITUD = c.PK_ESTADO_SOLICITUD')
  //     .innerJoin(CatSubEstadoSolicitud, 'x', 'm.FK_SUBESTADO_SOLICITUD = x.PK_SUBESTADO_SOLICITUD')

  //     if(estado === 0) {
  //       query.where('m.FK_PAIS = :pais', {pais: pais});
  //     } else {
  //       query.where('c.PK_ESTADO_SOLICITUD = :estado', {estado: estado})
  //           .andWhere('m.FK_PAIS = :pais', {pais: pais});
  //     }

  //     if(subestado === 0) {
  //       query.andWhere('x.PK_SUBESTADO_SOLICITUD = :subestado', {subestado: subestado});
  //     }
  //     //.getRawMany<SolicitudModel>();

  //     return await query.getRawMany<SolicitudModel>();
  // }
  // async GetByOwner(estado: number, subestado: number, pais: number, username?: string, supervisor?: string): Promise<SolicitudModel[]> {
  //   const query = this.solicitudRepository.createQueryBuilder('m')
  //     .select(["Id = m.PK_MTR_SOLICITUD",
  //       "Id_Estado = c.PK_ESTADO_SOLICITUD",
  //       "Estado = c.ESTADO",
  //       "Id_SubEstado = x.PK_SUBESTADO_SOLICITUD",
  //       "SubEstado = x.SUB_ESTADO",
  //       "Curp = m.IDENTIFICADOR",
  //       "Rfc = m.NUM_RFC",
  //       "TelefonoPrincipal = m.TELEFONO",
  //       "CorreoElectronico = m.CORREO",
  //       "Propietario = m.PROPIETARIO",
  //       "FechaSolicitud = DATEDIFF(SECOND,'1970-01-01',  m.FECHA_SOLICITUD)",
  //       "UltimaModificacion = m.FECHA_MODIFICACION"
  //     ])
  //     .innerJoin(CatEstadoSolicitud, 'c', 'm.FK_ESTADO_SOLICITUD = c.PK_ESTADO_SOLICITUD')
  //     .innerJoin(CatSubEstadoSolicitud, 'x', 'm.FK_SUBESTADO_SOLICITUD = x.PK_SUBESTADO_SOLICITUD')
  //     // .where('c.PK_ESTADO_SOLICITUD = :estado', {estado: estado}).orWhere('0 = :estado', {estado: estado})
  //     // .where('m.FK_PAIS = :pais', {pais: pais})
  //     // .where('x.PK_SUBESTADO_SOLICITUD = :subestado', {subestado: subestado}).orWhere('0 = :subestado', {subestado: subestado})
  //     // .where('m.PROPIETARIO = :username', {username: username}).orWhere('null = :username', {username: username})
  //     // .where('m.SUPERVISOR = :supervisor', {supervisor: supervisor}).orWhere('null = :supervisor', {supervisor: supervisor})
      

  //     if(estado === 0) {
  //       query.where('m.FK_PAIS = :pais', {pais: pais});
  //     } else {
  //       query.where('c.PK_ESTADO_SOLICITUD = :estado', {estado: estado})
  //           .andWhere('m.FK_PAIS = :pais', {pais: pais});
  //     }

  //     if(subestado === 0) {
  //       query.andWhere('x.PK_SUBESTADO_SOLICITUD = :subestado', {subestado: subestado});
  //     }
      
  //     console.log(username)
  //     if(username != null && username != undefined) {
  //       query.andWhere('m.PROPIETARIO = :username', {username: username});
  //     }

  //     console.log(supervisor)
  //     if(supervisor != null && supervisor != undefined) {
  //       query.andWhere('m.SUPERVISOR = :supervisor', {supervisor: supervisor});
  //     }

  //     return await query.getRawMany<SolicitudModel>();
  // }
}
