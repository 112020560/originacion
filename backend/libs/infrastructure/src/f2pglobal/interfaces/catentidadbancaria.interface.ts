/* eslint-disable prettier/prettier */
import { FindManyOptions, FindOneOptions } from "typeorm";
import { CatEntidadBancaria } from "../entities/CatEntidadBancaria";

export interface ICatEntidadBancariaRepository {
    findOneById(id: number): Promise<CatEntidadBancaria>;
    findByCondition(filterCondition: FindOneOptions<CatEntidadBancaria>): Promise<CatEntidadBancaria>;
    findAll(options?: FindManyOptions<CatEntidadBancaria>): Promise<CatEntidadBancaria[]>;
}