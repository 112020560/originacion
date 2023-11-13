/* eslint-disable prettier/prettier */
import { Prop } from "@nestjs/mongoose";

export class Offer {
  @Prop()
  Producto: number;
  @Prop()
  Plazo: number;
  @Prop()
  Cuota: number;
  @Prop()
  Ciclo: number;
  @Prop()
  Promocion_Plazo: number;
  @Prop()
  Activa: boolean;
  @Prop()
  Monto_venta: number;
  @Prop()
  Limite_Credito: number;
  @Prop()
  FechaOferta: Date;
  @Prop()
  FechaInactiva?: string | null;
  @Prop()
  Usuario: string | null;
  @Prop()
  UsuarioInactiva: string | null;
  @Prop()
  Tasa_Interes: number;
}
