/* eslint-disable prettier/prettier */
import { FindManyOptions, FindOneOptions } from "typeorm";
import { CatEstadoSolicitud } from "../entities/CatEstadoSolicitud";

export interface CatEstadoInterfaceRepository {
    findOneById(id: number): Promise<CatEstadoSolicitud>;
    findByCondition(filterCondition: FindOneOptions<CatEstadoSolicitud>): Promise<CatEstadoSolicitud>;
    findAll(options?: FindManyOptions<CatEstadoSolicitud>): Promise<CatEstadoSolicitud[]>;
}