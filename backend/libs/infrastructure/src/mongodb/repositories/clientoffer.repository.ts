/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoFindOneOptions } from 'typeorm/find-options/mongodb/MongoFindOneOptions';
import { MongoRepository } from 'typeorm/repository/MongoRepository';
import { AceptaOfertaSolicitud } from '../entities/clientoffer.entity';

@Injectable()
export class OfertaClienteRepository {
  constructor(
    @InjectRepository(AceptaOfertaSolicitud)
    private readonly solicitudDigitalRepository: MongoRepository<AceptaOfertaSolicitud>,
  ) {}

  async create(aceptaOferta: AceptaOfertaSolicitud) {
    return this.solicitudDigitalRepository.save(aceptaOferta);
  }

  async findAll() {
    return await this.solicitudDigitalRepository.find();
  }

  async findOne(id: string) {
    return await this.solicitudDigitalRepository.findOne({ where: { id: id } });
  }

  async findOneByFilter(filer: MongoFindOneOptions<AceptaOfertaSolicitud>) {
    return await this.solicitudDigitalRepository.findOne(filer);
  }

  async update(id: string, aceptaOferta: AceptaOfertaSolicitud) {
    return await this.solicitudDigitalRepository.update(id, aceptaOferta);
  }

  async remove(id: string) {
    return await this.solicitudDigitalRepository.delete(id);
  }
}
