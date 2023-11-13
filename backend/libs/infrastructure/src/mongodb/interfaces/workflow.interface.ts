/* eslint-disable prettier/prettier */
import { MongoFindOneOptions } from "typeorm/find-options/mongodb/MongoFindOneOptions";
import { WorkFlowStep } from "../entities/workflowsteps.entity";

export interface WorkFlowInterfaceRepository {
    create(folio: WorkFlowStep);
    findAll()
    findOne(id: string);
    findOneByFilter(filer: MongoFindOneOptions<WorkFlowStep>)
    update(id: string, folio: WorkFlowStep)
    remove(id: string)
}