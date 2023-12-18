import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_LOG_ACCION_SOLICITUD', ['id'], { unique: true })
@Entity('LOG_ACCION_SOLICITUD', { schema: 'Originacion' })
export class LogAccionSolicitud {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_LOG_ACCION_SOLICITUD' })
  id: number;

  @Column('varchar', { name: 'ACCION', length: 50 })
  accion: string;

  @Column('varchar', { name: 'DESCRIPCION', nullable: true, length: 1500 })
  descripcion: string | null;

  @Column('datetime', { name: 'FECHA_ACCION', nullable: true })
  fechaAccion: Date | null;

  @Column('varchar', { name: 'USUARIO', nullable: true, length: 20 })
  usuario: string | null;

  @ManyToOne(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.logAccionSolicituds,
  )
  @JoinColumn([{ name: 'FK_MTR_SOLICITUD', referencedColumnName: 'id' }])
  fkMtrSolicitud: MtrSolicitud;
}
