/* eslint-disable prettier/prettier */
import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class Buro {
  @Prop()
  buro: string;
  @Prop({type: mongoose.Schema.Types.Mixed})
  respuesta: any;
  @Prop()
  fecha: Date;
}
