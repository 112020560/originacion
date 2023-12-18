/* eslint-disable prettier/prettier */
import { CreateSaleDto } from "../../application/dtos/createsales.dto";
import { SalesConfirmModel } from "../models/salesconfirm.model";

export interface IAcceptOfferUseCases {
    execute(dto: CreateSaleDto): Promise<SalesConfirmModel>
}