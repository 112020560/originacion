/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
import { WorkFlowStep } from '../entities/workflowsteps.entity';
import { WorkFlowInterfaceRepository } from '../interfaces/workflow.interface';

@Injectable()
export class WorkflowRepository implements WorkFlowInterfaceRepository {
  constructor(
    @InjectModel(WorkFlowStep.name)
    private readonly workflowModel: Model<WorkFlowStep>,
  ) { }

  async create(workflowStep: WorkFlowStep) {
    const createdModel = new this.workflowModel(workflowStep)
    return await createdModel.save();
  }

  async findAll(): Promise<WorkFlowStep[]> {
    return await this.workflowModel.find().exec();
  }

  async findOne(id: string): Promise<WorkFlowStep> {
    return await this.workflowModel.findOne({ where: { id: id } }).exec();
  }

  async findOneByFilter(filer: MongoFindOneOptions<WorkFlowStep>): Promise<WorkFlowStep> {
    return await this.workflowModel.findOne(filer).exec();
  }

  async update(id: string, workflowStep: WorkFlowStep) {
    return await this.workflowModel.findOneAndUpdate({ id }, workflowStep);
  }

  async remove(id: string) {
    return await this.workflowModel.findOneAndDelete({ id });
  }
}
