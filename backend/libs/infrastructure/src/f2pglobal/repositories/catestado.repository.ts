/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindManyOptions, Repository } from 'typeorm';
import { CatEstadoSolicitud } from '../entities/CatEstadoSolicitud';
import { CatEstadoInterfaceRepository } from '../interfaces/catestadointerface.repository';

@Injectable()
export class CatStatusRepository implements CatEstadoInterfaceRepository {
    constructor(
        @InjectRepository(CatEstadoSolicitud) private readonly repository: Repository<CatEstadoSolicitud>
    ) {}
    async findOneById(id: number): Promise<CatEstadoSolicitud> {
        return await this.repository.findOne({where: {pkEstadoSolicitud: id}})
    }
    async findByCondition(filterCondition: FindOneOptions<CatEstadoSolicitud>): Promise<CatEstadoSolicitud> {
        return await this.repository.findOne(filterCondition);
    }
    async findAll(options?: FindManyOptions<CatEstadoSolicitud>): Promise<CatEstadoSolicitud[]> {
        return await this.repository.find(options);
    }

}
