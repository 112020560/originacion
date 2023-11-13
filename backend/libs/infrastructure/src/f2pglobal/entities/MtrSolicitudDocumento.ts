import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MtrSolicitud } from './MtrSolicitud.entity';

@Index('PK_MTR_SOLICITUD_DOCUMENTO', ['id'], {
  unique: true,
})
@Entity('MTR_SOLICITUD_DOCUMENTO', { schema: 'Originacion' })
export class MtrSolicitudDocumento {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'PK_MTR_SOLICITUD_DOCUMENTO',
  })
  id: number;

  @Column('varchar', { name: 'NOMBRE_DOCUMENTO', nullable: true, length: 150 })
  nombreDocumento: string | null;

  @Column('varchar', { name: 'RUTA_DOCUMENTO', nullable: true, length: 250 })
  rutaDocumento: string | null;

  @Column('varchar', { name: 'ESTADO_DOCUEMNTO', nullable: true, length: 50 })
  estadoDocuemnto: string | null;

  @Column('datetime', { name: 'FECHA_INGRESO_DOCUMENTO', nullable: true })
  fechaIngresoDocumento: Date | null;

  @Column('varchar', { name: 'TIPO_DOCUMENTO', nullable: true, length: 100 })
  tipoDocumento: string | null;

  @Column('varchar', { name: 'USUARIO', nullable: true, length: 50 })
  usuario: string | null;

  @Column('varchar', { name: 'HEADER', nullable: true, length: 50 })
  header: string | null;

  @ManyToOne(
    () => MtrSolicitud,
    (mtrSolicitud) => mtrSolicitud.mtrSolicitudDocumentos,
  )
  @JoinColumn([{ name: 'FK_MTR_SOLICITUD', referencedColumnName: 'id' }])
  fkMtrSolicitud: MtrSolicitud;
}
