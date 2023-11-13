/* eslint-disable prettier/prettier */
import { CatEntidadBancaria } from "@app/infrastructure/f2pglobal/entities/CatEntidadBancaria";
import { CatEstadoSolicitud } from "@app/infrastructure/f2pglobal/entities/CatEstadoSolicitud";
import { CatSubEstadoSolicitud } from "@app/infrastructure/f2pglobal/entities/CatSubEstadoSolicitud";

export interface ICatalogServices {
    getCatEntidadBancaria(): Promise<Array<CatEntidadBancaria>>;
    getEstadosSolicitud (): Promise<Array<CatEstadoSolicitud>>;
    getSubEstadosSolicitud(): Promise<Array<CatSubEstadoSolicitud>>;
} 