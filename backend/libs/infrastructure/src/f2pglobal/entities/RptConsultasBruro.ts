import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('PK__RPT_CONS__A9E0BEF91784ECA3', ['pkRptConsultasBruro'], {
  unique: true,
})
@Entity('RPT_CONSULTAS_BRURO', { schema: 'Originacion' })
export class RptConsultasBruro {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'PK_RPT_CONSULTAS_BRURO' })
  pkRptConsultasBruro: string;

  @Column('bigint', { name: 'FOLIO_CDC' })
  folioCdc: string;

  @Column('date', { name: 'FECHA_CONSULTA' })
  fechaConsulta: Date;

  @Column('time', { name: 'HORA_CONSULTA' })
  horaConsulta: Date;

  @Column('varchar', { name: 'NOMBRE_CLIENTE', length: 250 })
  nombreCliente: string;

  @Column('varchar', { name: 'RFC', length: 13 })
  rfc: string;

  @Column('varchar', { name: 'CALLE', nullable: true, length: 150 })
  calle: string | null;

  @Column('varchar', { name: 'COLONIA', nullable: true, length: 50 })
  colonia: string | null;

  @Column('varchar', { name: 'CIUDAD', nullable: true, length: 50 })
  ciudad: string | null;

  @Column('varchar', { name: 'ESTADO', nullable: true, length: 50 })
  estado: string | null;

  @Column('varchar', { name: 'TIPO_CONSULTA', length: 2 })
  tipoConsulta: string;

  @Column('varchar', { name: 'USUARIO', length: 10 })
  usuario: string;

  @Column('date', { name: 'FECHA_APROBACION_CONSULTA', nullable: true })
  fechaAprobacionConsulta: Date | null;

  @Column('time', { name: 'HORA_APROBACION_CONSULTA', nullable: true })
  horaAprobacionConsulta: Date | null;

  @Column('varchar', {
    name: 'INGRESO_NUEVAMENTE_PIN',
    nullable: true,
    length: 2,
  })
  ingresoNuevamentePin: string | null;

  @Column('varchar', {
    name: 'RESPUESTA_LEYENDA_AUTORIZACION',
    nullable: true,
    length: 2,
  })
  respuestaLeyendaAutorizacion: string | null;

  @Column('varchar', {
    name: 'ACEPTACION_TERMINOS_CONDICIONES',
    nullable: true,
    length: 2,
  })
  aceptacionTerminosCondiciones: string | null;

  @Column('varchar', { name: 'BURO', nullable: true, length: 50 })
  buro: string | null;

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
}
