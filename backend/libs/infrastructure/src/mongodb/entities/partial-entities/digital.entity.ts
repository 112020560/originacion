/* eslint-disable prettier/prettier */
import { Prop } from "@nestjs/mongoose";


export class Digital {
  @Prop()
  flujo?: string | null;
  @Prop()
  fechaFlujo?: string;
  @Prop()
  unixFechaLocal?: number;
  @Prop()
  InformacionFlujo?: string | null;
  @Prop()
  Tipo?: string | null;
}
