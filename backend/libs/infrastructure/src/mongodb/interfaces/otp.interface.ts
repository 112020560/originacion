/* eslint-disable prettier/prettier */
import { FilterQuery, UpdateQuery } from "mongoose";
import { Otp } from "../entities/otp.entity";


export interface OtpInterfaceRepository {
    create(otp: Otp);
    findAll(): Promise<Otp[]>
    findOne(id: string): Promise<Otp>;
    findOneByFilter(filer: FilterQuery<Otp>): Promise<Otp>
    update(filter: FilterQuery<Otp>, update: UpdateQuery<Otp>)
    remove(id: string)
}