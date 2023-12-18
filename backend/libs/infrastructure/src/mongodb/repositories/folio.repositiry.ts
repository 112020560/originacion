/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Folio } from '../entities/folio.entity';
import { FolioInterfaceRepository } from '../interfaces/folio.interface';

@Injectable()
export class MongoFolioRepository implements FolioInterfaceRepository {
  constructor(
    @InjectModel(Folio.name)
    private readonly folioModel: Model<Folio>,
  ) { }

  async create(folio: Folio) {
    const createdModel = new this.folioModel(folio)
    return await createdModel.save();
  }

  async findAll(): Promise<Folio[]> {
    return await this.folioModel.find().exec();
  }

  async findOne(id: string): Promise<Folio> {
    return await this.folioModel.findOne({ where: { id: id } }).exec();
  }

  async findOneByFilter(filer: FilterQuery<Folio>): Promise<Folio> {
    return await this.folioModel.findOne(filer).exec();
  }

  async update(filter: FilterQuery<Folio>, update: UpdateQuery<Folio>) {
    return await this.folioModel.findOneAndUpdate(filter, update);
  }

  async remove(id: string) {
    return await this.folioModel.findOneAndRemove({ id });
  }
}
