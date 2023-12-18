/* eslint-disable prettier/prettier */
import { MongoFindOneOptions } from "typeorm/find-options/mongodb/MongoFindOneOptions";
import { LinksSolicitud } from "../entities/linksolicitud.entity";



export interface LinkSolicitudInterface {
    create(linkSolicitud: LinksSolicitud); 
    findAll(): Promise<LinksSolicitud[]>;
    findOne(id: string): Promise<LinksSolicitud>;
    findOneByFilter(filer: MongoFindOneOptions<LinksSolicitud>): Promise<LinksSolicitud>
    update(id: string, linkSolicitud: LinksSolicitud)
    remove(id: string)
}