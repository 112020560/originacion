/* eslint-disable prettier/prettier */
import { CatEntidadBancaria } from "@app/infrastructure/f2pglobal/entities/CatEntidadBancaria";
import { CatEstadoSolicitud } from "@app/infrastructure/f2pglobal/entities/CatEstadoSolicitud";
import { CatSubEstadoSolicitud } from "@app/infrastructure/f2pglobal/entities/CatSubEstadoSolicitud";
import { CatEstadoInterfaceRepository, CatSubEstadoInterfaceRepository, ICatEntidadBancariaRepository } from "@app/infrastructure/f2pglobal/interfaces";
import { Inject, Injectable } from "@nestjs/common";
import { ICatalogServices } from "../domain/interfaces/catalog.interface";

@Injectable()
export class CatalogServices implements ICatalogServices {
    constructor(
        @Inject('ICatEntidadBancariaRepository')
        private readonly _cat_entidadbancaria: ICatEntidadBancariaRepository,
        @Inject('CatEstadoInterfaceRepository')
        private readonly estadoRepository: CatEstadoInterfaceRepository,
        @Inject('CatSubEstadoInterfaceRepository')
        private readonly subEstadoRepository: CatSubEstadoInterfaceRepository
    ) {

    }

    public getCatEntidadBancaria = async (): Promise<Array<CatEntidadBancaria>> => {
        return await this._cat_entidadbancaria.findAll({ where: { ACTIVO: true, VISIBLE: true } });
    }

    public getEstadosSolicitud = async (): Promise<Array<CatEstadoSolicitud>> => {
        return await this.estadoRepository.findAll({ where: { activo: true, visible: true } });
    }

    public getSubEstadosSolicitud = async (): Promise<Array<CatSubEstadoSolicitud>> => {
        return await this.subEstadoRepository.findAll({ where: { activo: true, visible: true }, relations: {fkEstado: true} });
    }
}