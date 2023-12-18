/* eslint-disable prettier/prettier */
import { Folio } from "@app/infrastructure/mongodb/entities/folio.entity";
import { Offer } from "@app/infrastructure/mongodb/entities/partial-entities/offer.entity";
import { ImpresionResponse } from "../../domain/models/impresion.model";
import { IngresaVentaResponse } from "../../domain/models/ingresaventaresponse.model";
import { IngresaVentaModel } from "../../domain/models/salescreate.model";
import { PlantillaSmsResponse } from "../../domain/models/template.model";

export interface ICoreService {
    insertCoreSale(folio: Folio, ingresaVentaModel: IngresaVentaModel): Promise<IngresaVentaResponse>;
    approveCoreSale(id_cola_revision: number, ingresaVentaModel: IngresaVentaModel): Promise<Array<ImpresionResponse>>;
    getTamplete(digiltaFlow: string, fullName: string, link: string, offer: Offer): Promise<Array<PlantillaSmsResponse>>;
}