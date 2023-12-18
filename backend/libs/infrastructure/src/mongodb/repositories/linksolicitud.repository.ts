/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
import { LinksSolicitud } from '../entities/linksolicitud.entity';

@Injectable()
export class LinkSolicitudRepository {
  constructor(
    @InjectModel(LinksSolicitud.name)
    private readonly linkSolicitudmodel: Model<LinksSolicitud>
  ) { }

  async create(linkSolicitud: LinksSolicitud) {
    const createdModel = new this.linkSolicitudmodel(linkSolicitud)
    return await createdModel.save();
  }

  async findAll(): Promise<LinksSolicitud[]> {
    return await this.linkSolicitudmodel.find().exec();
  }

  async find(filer: FilterQuery<LinksSolicitud>): Promise<LinksSolicitud[]> {
    return await this.linkSolicitudmodel.find(filer).exec();
  }

  async findOne(id: string): Promise<LinksSolicitud> {
    return await this.linkSolicitudmodel.findOne({ where: { id: id } }).exec();
  }

  async findOneByFilter(filer: FilterQuery<LinksSolicitud>): Promise<LinksSolicitud> {
    console.log(filer)
    return await this.linkSolicitudmodel.findOne(filer).exec();
  }

  async update(filter: FilterQuery<LinksSolicitud>, update: UpdateQuery<LinksSolicitud>) {
    return await this.linkSolicitudmodel.findOneAndUpdate(filter, update);
  }

  async remove(id: string) {
    return await this.linkSolicitudmodel.findOneAndDelete({ id });
  }
}
