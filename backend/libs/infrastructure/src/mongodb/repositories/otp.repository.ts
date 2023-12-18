/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Otp } from '../entities/otp.entity';
import { OtpInterfaceRepository } from '../interfaces/otp.interface';

@Injectable()
export class OtpRepository implements OtpInterfaceRepository{

    constructor(
        @InjectModel(Otp.name)
        private readonly otpModel: Model<Otp>
      ) { }

      async create(otp: Otp) {
        const createdModel = new this.otpModel(otp)
        return await createdModel.save();
      }
    
      async findAll(): Promise<Otp[]> {
        return await this.otpModel.find().exec();
      }
    
      async findOne(id: string): Promise<Otp> {
        return await this.otpModel.findOne({ where: { id: id } }).exec();
      }
    
      async findOneByFilter(filer: FilterQuery<Otp>): Promise<Otp> {
        console.log(filer)
        return await this.otpModel.findOne(filer).exec();
      }
    
      async update(filter: FilterQuery<Otp>, update: UpdateQuery<Otp>) {
        return await this.otpModel.findOneAndUpdate(filter, update);
      }
    
      async remove(id: string) {
        return await this.otpModel.findOneAndDelete({ id });
      }
}
