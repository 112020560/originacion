/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FolioDocument = Otp & Document;


@Schema({ collection: 'Otp' })
export class Otp {
    id?: string;
    @Prop()
    id_Solicitud: number;
    @Prop()
    otp: string | null;
    @Prop()
    status: string
    @Prop()
    createAt: Date;
    @Prop()
    dueDate: Date;
    @Prop()
    retrys: number;
    @Prop()
    userName: string | null;
    @Prop()
    updateAt?: Date;
    @Prop()
    userUpdate?: string;
}


export const OtpSchema = SchemaFactory.createForClass(Otp)