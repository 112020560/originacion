import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_TRA_SOLICITUD_KYC', ['pkTraSolicitudKyc'], { unique: true })
@Entity('TRA_SOLICITUD_KYC', { schema: 'Originacion' })
export class TraSolicitudKyc {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_TRA_SOLICITUD_KYC' })
  pkTraSolicitudKyc: string;

  @Column('varchar', { name: 'ID_REFERENCIA_MONGO', length: 50 })
  idReferenciaMongo: string;

  @Column('datetime', { name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column('varchar', { name: 'USUARIO_CREACION', length: 20 })
  usuarioCreacion: string;

  @ManyToOne(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.traSolicitudKycs,
  )
  @JoinColumn([{ name: 'FK_MTR_SOLICITUD', referencedColumnName: 'id' }])
  fkMtrSolicitud: MtrSolicitud;
}
