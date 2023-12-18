/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
import { InformacionKyC } from '../entities/informationkyc.entity';

@Injectable()
export class InformacionKyCRepository {
  constructor(
    @InjectRepository(InformacionKyC)
    private readonly linkSolicitudRepository: MongoRepository<InformacionKyC>,
  ) {}

  async create(linkSolicitud: InformacionKyC) {
    return this.linkSolicitudRepository.save(linkSolicitud);
  }

  async findAll() {
    return await this.linkSolicitudRepository.find();
  }

  async findOne(id: string) {
    return await this.linkSolicitudRepository.findOne({ where: {id: id}});
  }

  async findOneByFilter(filer: MongoFindOneOptions<InformacionKyC>) {
    return await this.linkSolicitudRepository.findOne(filer);
  }

  async update(id: string, linkSolicitud: InformacionKyC) {
    return await this.linkSolicitudRepository.update(id, linkSolicitud);
  }

  async remove(id: string) {
    return await this.linkSolicitudRepository.delete(id);
  }
}
