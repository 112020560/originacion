/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

export type LinkDocument = LinksSolicitud & Document;

@Schema({collection: 'LinksSolicitud'})
export class LinksSolicitud {
    id?: string;
    @Prop()
    Id_Solicitud: number;
    @Prop()
    Token: string | null;
    @Prop()
    Tipo: string | null;
    @Prop()
    FechaGeneracion: Date;
    @Prop()
    FechaVencimiento: Date;
    @Prop()
    Link: string | null;
    @Prop()
    UsuarioGenera: string | null;
    @Prop()
    Estado: string;
    @Prop()
    FechaUtilizo: Date;
    @Prop()
    Reenvios: number;
    @Prop()
    Renviar: boolean;
    @Prop()
    CanalEnvio: string | null;
    @Prop()
    Observacion: string | null;
    @Prop()
    CreatedAt: Date
    @Prop()
    Password?: string;
}

export const LinkSchema = SchemaFactory.createForClass(LinksSolicitud);
