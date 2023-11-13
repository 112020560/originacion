import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParSolicitudPasosFlujo } from './ParSolicitudPasosFlujo';

@Index('PK_PAR_SOLICITUD_PASOS', ['pkParSolicitudPasos'], { unique: true })
@Entity('PAR_SOLICITUD_PASOS', { schema: 'Originacion' })
export class ParSolicitudPasos {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_PAR_SOLICITUD_PASOS' })
  pkParSolicitudPasos: string;

  @Column('varchar', { name: 'PASO', nullable: true, length: 50 })
  paso: string | null;

  @Column('varchar', { name: 'DESCRIPCION', nullable: true, length: 150 })
  descripcion: string | null;

  @Column('varchar', { name: 'ACCION', nullable: true, length: 100 })
  accion: string | null;

  @Column('varchar', { name: 'LLAVE01', nullable: true, length: 20 })
  llave01: string | null;

  @Column('varchar', { name: 'LLAVE02', nullable: true, length: 20 })
  llave02: string | null;

  @OneToMany(
    () => ParSolicitudPasosFlujo,
    (parSolicitudPasosFlujo) => parSolicitudPasosFlujo.fkParSolicitudPasos,
  )
  parSolicitudPasosFlujos: ParSolicitudPasosFlujo[];
}
