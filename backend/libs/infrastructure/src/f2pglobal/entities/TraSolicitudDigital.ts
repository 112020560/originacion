import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_TRA_SOLICITUD_DIGITAL', ['pkTraSolicitudDigital'], { unique: true })
@Entity('TRA_SOLICITUD_DIGITAL', { schema: 'Originacion' })
export class TraSolicitudDigital {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_TRA_SOLICITUD_DIGITAL' })
  pkTraSolicitudDigital: string;

  @Column('varchar', { name: 'FLUJO_ORIGEN', length: 50 })
  flujoOrigen: string;

  @Column('varchar', { name: 'ID_REFERENCIA_MONGO', length: 50 })
  idReferenciaMongo: string;

  @Column('varchar', { name: 'ID_REFERENCIA_PROVEEDOR', length: 50 })
  idReferenciaProveedor: string;

  @Column('datetime', { name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column('varchar', { name: 'USUARIO_CREACION', length: 20 })
  usuarioCreacion: string;

  @ManyToOne(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.traSolicitudDigitals,
  )
  @JoinColumn([{ name: 'FK_MTR_SOLICITUD', referencedColumnName: 'id' }])
  fkMtrSolicitud: MtrSolicitud;
}
