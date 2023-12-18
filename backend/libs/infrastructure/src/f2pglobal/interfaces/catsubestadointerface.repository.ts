/* eslint-disable prettier/prettier */
import { FindManyOptions, FindOneOptions } from "typeorm";
import { CatSubEstadoSolicitud } from "../entities/CatSubEstadoSolicitud";

export interface CatSubEstadoInterfaceRepository {
    findOneById(id: number): Promise<CatSubEstadoSolicitud>;
    findByCondition(filterCondition: FindOneOptions<CatSubEstadoSolicitud>): Promise<CatSubEstadoSolicitud>;
    findAll(options?: FindManyOptions<CatSubEstadoSolicitud>): Promise<CatSubEstadoSolicitud[]>;
}