/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindManyOptions, Repository } from 'typeorm';
import { CatSubEstadoSolicitud } from '../entities/CatSubEstadoSolicitud';
import { CatSubEstadoInterfaceRepository } from '../interfaces/catsubestadointerface.repository';

@Injectable()
export class CatSubStatusRepository implements CatSubEstadoInterfaceRepository {
    constructor(
        @InjectRepository(CatSubEstadoSolicitud) private readonly repository: Repository<CatSubEstadoSolicitud>
    ) {}
    async findOneById(id: number): Promise<CatSubEstadoSolicitud> {
        return await this.repository.findOne({where: {pkSubestadoSolicitud: id}})
    }
    async findByCondition(filterCondition: FindOneOptions<CatSubEstadoSolicitud>): Promise<CatSubEstadoSolicitud> {
        return await this.repository.findOne(filterCondition);
    }
    async findAll(options?: FindManyOptions<CatSubEstadoSolicitud>): Promise<CatSubEstadoSolicitud[]> {
        return await this.repository.find(options);
    }

}
