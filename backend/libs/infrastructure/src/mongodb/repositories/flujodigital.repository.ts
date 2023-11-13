/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
import { MongoRepository } from 'typeorm/repository/MongoRepository';
import { FlujoDigital } from '../entities/digitalflow.entity';

@Injectable()
export class FlujoDigitalRepository {
  constructor(
    @InjectRepository(FlujoDigital)
    private readonly solicitudDigitalRepository: MongoRepository<FlujoDigital>,
  ) { }

  async create(flujoDigital: FlujoDigital) {
    return this.solicitudDigitalRepository.save(flujoDigital);
  }

  async findAll() {
    return await this.solicitudDigitalRepository.find();
  }

  async findOne(id: string) {
    return await this.solicitudDigitalRepository.findOne({ where: { id: id } });
  }

  async findOneByFilter(filer: MongoFindOneOptions<FlujoDigital>) {
    return await this.solicitudDigitalRepository.findOne(filer);
  }

  async update(id: string, flujoDigital: FlujoDigital) {
    return await this.solicitudDigitalRepository.update(id, flujoDigital);
  }

  async remove(id: string) {
    return await this.solicitudDigitalRepository.delete(id);
  }
}
