/* eslint-disable prettier/prettier */
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { CatEntidadBancaria } from "../entities/CatEntidadBancaria";
import { ICatEntidadBancariaRepository } from "../interfaces/catentidadbancaria.interface";

export class CatEntidadBancariaRepository implements ICatEntidadBancariaRepository {
    constructor(
        @InjectRepository(CatEntidadBancaria)
        private readonly repository: Repository<CatEntidadBancaria>,
    ) { }

    async findOneById(id: number): Promise<CatEntidadBancaria> {
        return await this.repository.findOne({ where: { PK_UTL_CAT_ENTIDAD: id } })
    }
    async findByCondition(filterCondition: FindOneOptions<CatEntidadBancaria>): Promise<CatEntidadBancaria> {
        return await this.repository.findOne(filterCondition);
    }
    async findAll(options?: FindManyOptions<CatEntidadBancaria>): Promise<CatEntidadBancaria[]> {
        return await this.repository.find(options);
    }
} 