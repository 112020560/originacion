/* eslint-disable prettier/prettier */
import { Column, Entity } from 'typeorm';
import { CommonDocument } from './common.entity'

@Entity('FlujoDigital')
export class FlujoDigital extends CommonDocument {
    @Column()
    Id_Solicitud?: number;
    @Column()
    Flujo?: string | null;
    @Column()
    FechaLocalFlujo?: string;
    @Column()
    InformacionFlujo?: string | null;
    @Column()
    Tipo?: string | null;
}
