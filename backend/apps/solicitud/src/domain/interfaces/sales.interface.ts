/* eslint-disable prettier/prettier */
import { SalesConfirmModel } from "../models/salesconfirm.model";
import { IngresaVentaModel } from "../models/salescreate.model";

export interface IInsertSaleUseCases {
  createSales(model: IngresaVentaModel): Promise<SalesConfirmModel>;
}
