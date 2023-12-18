/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { TraSolicitudCuentaBanco } from '../entities/TraSolicitudCuentaBanco';
import { ISolicitudCuentaRepository } from '../interfaces/solicitudctabankinterface.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class SolicitudCuentaRepository extends BaseAbstractRepository<TraSolicitudCuentaBanco> implements ISolicitudCuentaRepository {

    constructor(
        @InjectRepository(TraSolicitudCuentaBanco)
        private solicitudRepository: Repository<TraSolicitudCuentaBanco>,
    ) {
        super(solicitudRepository);
    }
}
