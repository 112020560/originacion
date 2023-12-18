import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LogAccionSolicitud } from './LogAccionSolicitud';
import { CatEstadoSolicitud } from './CatEstadoSolicitud';
import { CatSubEstadoSolicitud } from './CatSubEstadoSolicitud';
import { MtrSolicitudDocumento } from './MtrSolicitudDocumento';
import { TraSolicitudBuro } from './TraSolicitudBuro';
import { TraSolicitudCuentaBanco } from './TraSolicitudCuentaBanco';
import { TraSolicitudDigital } from './TraSolicitudDigital';
import { TraSolicitudKyc } from './TraSolicitudKyc';

@Index(
  'INX_SOLICITUD_ESTADOS',
  [
    'correo',
    'fechaModificacion',
    'fechaSolicitud',
    'fkSubestadoSolicitud',
    'identificador',
    'nombre',
    'numRfc',
    'id',
    'propietario',
    'fkEstadoSolicitud',
    'fkPais',
  ],
  {},
)
@Index(
  'INX_SOLICITUD_ESTADOS_PROPIETARIO',
  [
    'id',
    'supervisor',
    'fechaSolicitud',
    'fechaModificacion',
    'identificador',
    'numRfc',
    'correo',
    'telefono',
    'nombre',
    'fkPais',
    'fkEstadoSolicitud',
    'fkSubestadoSolicitud',
    'propietario',
  ],
  {},
)
@Index('PK_Solicitud', ['id'], { unique: true })
@Entity('MTR_SOLICITUD', { schema: 'Originacion' })
export class MtrSolicitud {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_MTR_SOLICITUD' })
  id?: number;

  @Column('int', { name: 'FK_PAIS' })
  fkPais: number;

  @Column('int', { name: 'FK_ESTADO_SOLICITUD', nullable: true })
  fkEstadoSolicitud: number | null;

  @Column('int', { name: 'FK_SUBESTADO_SOLICITUD', nullable: true })
  fkSubestadoSolicitud: number | null;

  @Column('varchar', { name: 'IDENTIFICADOR', nullable: true, length: 50 })
  identificador?: string | null;

  @Column('varchar', { name: 'NUM_RFC', nullable: true, length: 50 })
  numRfc?: string | null;

  @Column('varchar', { name: 'NOMBRE', nullable: true, length: 150 })
  nombre?: string | null;

  @Column('varchar', { name: 'CORREO', nullable: true, length: 100 })
  correo?: string | null;

  @Column('varchar', { name: 'TELEFONO', nullable: true, length: 20 })
  telefono?: string | null;

  @Column('datetime', { name: 'FECHA_SOLICITUD', nullable: true })
  fechaSolicitud: Date | null;

  @Column('varchar', {
    name: 'ID_SESSION_PROVEEDOR',
    nullable: true,
    length: 50,
  })
  idSessionProveedor?: string | null;

  @Column('varchar', { name: 'PROPIETARIO', nullable: true, length: 50 })
  propietario?: string | null;

  @Column('datetime', { name: 'FECHA_CREACION', nullable: true })
  fechaCreacion: Date | null;

  @Column('varchar', { name: 'USUARIO_CREACION', nullable: true, length: 20 })
  usuarioCreacion: string | null;

  @Column('datetime', { name: 'FECHA_MODIFICACION', nullable: true })
  fechaModificacion?: Date | null;

  @Column('varchar', {
    name: 'USUARIO_MODIFICACION',
    nullable: true,
    length: 20,
  })
  usuarioModificacion?: string | null;

  @Column('varchar', {
    name: 'IDENTIFICADOR_EXTERNO',
    nullable: true,
    length: 10,
  })
  identificadorExterno?: string | null;

  @Column('varchar', { name: 'SUPERVISOR', nullable: true, length: 50 })
  supervisor: string | null;

  @Column('varchar', { name: 'CANAL_VENTA', nullable: true, length: 20 })
  canalVenta: string | null;

  @OneToMany(
    () => LogAccionSolicitud,
    (logAccionSolicitud) => logAccionSolicitud.fkMtrSolicitud,
  )
  logAccionSolicituds?: LogAccionSolicitud[];

  @ManyToOne(
    () => CatEstadoSolicitud,
    (catEstadoSolicitud) => catEstadoSolicitud.mtrSolicituds,
  )
  @JoinColumn([
    { name: 'FK_ESTADO_SOLICITUD', referencedColumnName: 'pkEstadoSolicitud' },
  ])
  fkEstadoSolicitud2?: CatEstadoSolicitud;

  @ManyToOne(
    () => CatSubEstadoSolicitud,
    (catSubEstadoSolicitud) => catSubEstadoSolicitud.mtrSolicituds,
  )
  @JoinColumn([
    {
      name: 'FK_SUBESTADO_SOLICITUD',
      referencedColumnName: 'pkSubestadoSolicitud',
    },
  ])
  fkSubestadoSolicitud2?: CatSubEstadoSolicitud;

  @OneToMany(
    () => MtrSolicitudDocumento,
    (mtrSolicitudDocumento) => mtrSolicitudDocumento.fkMtrSolicitud,
  )
  mtrSolicitudDocumentos?: MtrSolicitudDocumento[];

  @OneToMany(
    () => TraSolicitudBuro,
    (traSolicitudBuro) => traSolicitudBuro.fkMtrSolicitud,
  )
  traSolicitudBuros?: TraSolicitudBuro[];

  @OneToMany(
    () => TraSolicitudCuentaBanco,
    (traSolicitudCuentaBanco) => traSolicitudCuentaBanco.fkMtrSolicitud,
  )
  traSolicitudCuentaBancos?: TraSolicitudCuentaBanco[];

  @OneToMany(
    () => TraSolicitudDigital,
    (traSolicitudDigital) => traSolicitudDigital.fkMtrSolicitud,
  )
  traSolicitudDigitals?: TraSolicitudDigital[];

  @OneToMany(
    () => TraSolicitudKyc,
    (traSolicitudKyc) => traSolicitudKyc.fkMtrSolicitud,
  )
  traSolicitudKycs?: TraSolicitudKyc[];
}
