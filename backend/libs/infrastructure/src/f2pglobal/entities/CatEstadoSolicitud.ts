import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CatSubEstadoSolicitud } from './CatSubEstadoSolicitud';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_CAT_ESTADO__SOLICITUD', ['pkEstadoSolicitud'], { unique: true })
@Entity('CAT_ESTADO_SOLICITUD', { schema: 'Originacion' })
export class CatEstadoSolicitud {
  @Column('int', { primary: true, name: 'PK_ESTADO_SOLICITUD' })
  pkEstadoSolicitud: number;

  @Column('varchar', { name: 'ESTADO', length: 50 })
  estado: string;

  @Column('varchar', { name: 'DESCRIPCION', nullable: true, length: 150 })
  descripcion: string | null;

  @Column('bit', { name: 'ACTIVO' })
  activo: boolean;

  @Column('bit', { name: 'VISIBLE' })
  visible: boolean;

  @Column('datetime', { name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column('varchar', { name: 'USUARIO_CREACION', length: 20 })
  usuarioCreacion: string;

  @Column('datetime', { name: 'FECHA_MODIFICACION', nullable: true })
  fechaModificacion: Date | null;

  @Column('varchar', {
    name: 'USUARIO_MODIFICACION',
    nullable: true,
    length: 20,
  })
  usuarioModificacion: string | null;

  @OneToMany(
    () => CatSubEstadoSolicitud,
    (catSubEstadoSolicitud) => catSubEstadoSolicitud.fkEstado,
  )
  catSubEstadoSolicituds: CatSubEstadoSolicitud[];

  @OneToMany(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.fkEstadoSolicitud2,
  )
  mtrSolicituds: MtrSolicitud[];
}
