import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatFlujo } from './CatFlujo';
import { ParSolicitudPasos } from './ParSolicitudPasos';

@Index('PK_PAR_SOLICTUD_PASOS_FLUJO', ['pkParSolictudPasosFlujo'], {
  unique: true,
})
@Entity('PAR_SOLICITUD_PASOS_FLUJO', { schema: 'Originacion' })
export class ParSolicitudPasosFlujo {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'PK_PAR_SOLICTUD_PASOS_FLUJO',
  })
  pkParSolictudPasosFlujo: string;

  @Column('int', { name: 'ORDEN', nullable: true })
  orden: number | null;

  @Column('varchar', { name: 'ACCION', nullable: true, length: 20 })
  accion: string | null;

  @Column('varchar', { name: 'LLAVE01', nullable: true, length: 50 })
  llave01: string | null;

  @Column('varchar', { name: 'LLAVE02', nullable: true, length: 50 })
  llave02: string | null;

  @Column('varchar', { name: 'LLAVE03', nullable: true, length: 50 })
  llave03: string | null;

  @Column('varchar', { name: 'COMODIN', nullable: true, length: 50 })
  comodin: string | null;

  @Column('varchar', { name: 'COMODIN01', nullable: true, length: 50 })
  comodin01: string | null;

  @Column('varchar', { name: 'COMODIN02', nullable: true, length: 50 })
  comodin02: string | null;

  @ManyToOne(() => CatFlujo, (catFlujo) => catFlujo.parSolicitudPasosFlujos)
  @JoinColumn([{ name: 'FK_CAT_FLUJO', referencedColumnName: 'pkCatFlujo' }])
  fkCatFlujo: CatFlujo;

  @ManyToOne(
    () => ParSolicitudPasos,
    (parSolicitudPasos) => parSolicitudPasos.parSolicitudPasosFlujos,
  )
  @JoinColumn([
    {
      name: 'FK_PAR_SOLICITUD_PASOS',
      referencedColumnName: 'pkParSolicitudPasos',
    },
  ])
  fkParSolicitudPasos: ParSolicitudPasos;
}
