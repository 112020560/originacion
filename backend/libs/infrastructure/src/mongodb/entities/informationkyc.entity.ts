/* eslint-disable prettier/prettier */
import { Column, Entity } from 'typeorm';
import { CommonDocument } from './common.entity';

@Entity('InformacionKyC')
export class InformacionKyC extends CommonDocument {
    @Column()
    Id_Solicitud: number;
    @Column()
    FechaLocal: string;
    @Column()
    KyC: string | null;
}
