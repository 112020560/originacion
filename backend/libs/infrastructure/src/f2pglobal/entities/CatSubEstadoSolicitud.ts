import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatEstadoSolicitud } from './CatEstadoSolicitud';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_CAT_SUB_ESTADO_SOLICITUD', ['pkSubestadoSolicitud'], {
  unique: true,
})
@Entity('CAT_SUB_ESTADO_SOLICITUD', { schema: 'Originacion' })
export class CatSubEstadoSolicitud {
  @PrimaryGeneratedColumn({ type: 'int', name: 'PK_SUBESTADO_SOLICITUD' })
  pkSubestadoSolicitud: number;

  @Column('varchar', { name: 'SUB_ESTADO', length: 50 })
  subEstado: string;

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

  @Column('varchar', { name: 'LLAVE_BUSQUEDA', nullable: true, length: 50 })
  llaveBusqueda: string | null;

  @ManyToOne(
    () => CatEstadoSolicitud,
    (catEstadoSolicitud) => catEstadoSolicitud.catSubEstadoSolicituds,
  )
  @JoinColumn([
    { name: 'FK_ESTADO', referencedColumnName: 'pkEstadoSolicitud' },
  ])
  fkEstado: CatEstadoSolicitud;

  @OneToMany(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.fkSubestadoSolicitud2,
  )
  mtrSolicituds: MtrSolicitud[];
}
