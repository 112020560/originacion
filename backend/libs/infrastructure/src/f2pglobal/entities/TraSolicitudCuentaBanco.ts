import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_TRA_SOLICITUD_CUENTA_BANCO', ['id'], {
  unique: true,
})
@Entity('TRA_SOLICITUD_CUENTA_BANCO', { schema: 'Originacion' })
export class TraSolicitudCuentaBanco {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'PK_TRA_SOLICITUD_CUENTA_BANCO',
  })
  id: number;

  @Column('varchar', { name: 'CUENTA', length: 70 })
  cuenta: string;

  @Column('bit', { name: 'VALIDADA' })
  validada: boolean;

  @Column('varchar', { name: 'BANCO', nullable: true, length: 50 })
  banco: string | null;

  @Column('varchar', {
    name: 'LLAVE_REGISTRO_PROVEEDOR',
    nullable: true,
    length: 50,
  })
  llaveRegistroProveedor: string | null;

  @Column('varchar', { name: 'OBSERVACION', nullable: true, length: 150 })
  observacion: string | null;

  @Column('datetime', { name: 'FECHA_CREACION' })
  fechaCreacion: Date;

  @Column('varchar', { name: 'USUARIO', length: 20 })
  usuario: string;

  @ManyToOne(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.traSolicitudCuentaBancos,
  )
  @JoinColumn([{ name: 'FK_MTR_SOLICITUD', referencedColumnName: 'id' }])
  fkMtrSolicitud: MtrSolicitud;
}
