/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { MtrSolicitudDocumento } from '../entities/MtrSolicitudDocumento';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ISolicitudDocumentoRepository } from '../interfaces/documentos.interface.repository';

@Injectable()
export class SolicitudDocumentoRepository extends BaseAbstractRepository<MtrSolicitudDocumento> implements ISolicitudDocumentoRepository {
      constructor(@InjectRepository(MtrSolicitudDocumento) private readonly repository: Repository<MtrSolicitudDocumento>) {
          super(repository);
      }
  }
