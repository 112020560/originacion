/* eslint-disable prettier/prettier */
import {Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { LogAccionSolicitud } from '../entities/LogAccionSolicitud';
import { Repository } from 'typeorm';
import { ISolicitudLogAccionRepository } from '../interfaces/logaccion.interface.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LogAccionRepository
  extends BaseAbstractRepository<LogAccionSolicitud>
  implements ISolicitudLogAccionRepository {

    constructor( @InjectRepository(LogAccionSolicitud) private readonly repository: Repository<LogAccionSolicitud>){
        super(repository);
    }

  }
