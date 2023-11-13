/* eslint-disable prettier/prettier */
import { CommonDocument } from './common.entity'
import { Column, Entity } from 'typeorm';

@Entity('AceptaOfertaSolicitud')
export class AceptaOfertaSolicitud extends CommonDocument {
    @Column()
    Id_Solicitud: number;
    @Column()
    Producto: number;
    @Column()
    Plazo: number;
    @Column()
    Cuota: number;
    @Column()
    Ciclo: number;
    @Column()
    Promocion_Plazo: number;
    @Column()
    Activa: boolean;
    @Column()
    Monto_venta: number;
    @Column()
    Limite_Credito: number;
    @Column()
    FechaOferta: string;
    @Column()
    FechaInactiva: string;
    @Column()
    Usuario: string | null;
    @Column()
    UsuarioInactiva: string | null;
    @Column()
    Tasa_Interes: number;
}
