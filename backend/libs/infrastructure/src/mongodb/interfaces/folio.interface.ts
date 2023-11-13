/* eslint-disable prettier/prettier */
import { FilterQuery, UpdateQuery } from "mongoose";
import { Folio } from "../entities/folio.entity";

export interface FolioInterfaceRepository {
    create(folio: Folio);
    findAll(): Promise<Folio[]>
    findOne(id: string): Promise<Folio>;
    findOneByFilter(filer: FilterQuery<Folio>): Promise<Folio>
    update(filter: FilterQuery<Folio>, update: UpdateQuery<Folio>)
    remove(id: string)
}