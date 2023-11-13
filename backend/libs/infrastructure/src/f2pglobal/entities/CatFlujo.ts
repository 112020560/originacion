import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParSolicitudPasosFlujo } from './ParSolicitudPasosFlujo';

@Index('PK_CAT_FLUJO', ['pkCatFlujo'], { unique: true })
@Entity('CAT_FLUJO', { schema: 'Originacion' })
export class CatFlujo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'PK_CAT_FLUJO' })
  pkCatFlujo: number;

  @Column('varchar', { name: 'FLUJO', nullable: true, length: 50 })
  flujo: string | null;

  @Column('varchar', { name: 'DESCRIPCION', nullable: true, length: 150 })
  descripcion: string | null;

  @Column('bit', { name: 'ACTIVO', nullable: true })
  activo: boolean | null;

  @Column('bit', { name: 'VISIBLE', nullable: true })
  visible: boolean | null;

  @Column('datetime', { name: 'FECHA_CREACION', nullable: true })
  fechaCreacion: Date | null;

  @Column('varchar', { name: 'USUARIO_CREACION', nullable: true, length: 20 })
  usuarioCreacion: string | null;

  @Column('datetime', { name: 'FECHA_MODIFICACION', nullable: true })
  fechaModificacion: Date | null;

  @Column('varchar', {
    name: 'USUARIO_MODIFICACION',
    nullable: true,
    length: 20,
  })
  usuarioModificacion: string | null;

  @OneToMany(
    () => ParSolicitudPasosFlujo,
    (parSolicitudPasosFlujo) => parSolicitudPasosFlujo.fkCatFlujo,
  )
  parSolicitudPasosFlujos: ParSolicitudPasosFlujo[];
}
