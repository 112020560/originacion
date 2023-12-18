import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('PK_PAR_ESTADOS_ROLE', ['pkParEstadosRole'], { unique: true })
@Entity('PAR_ESTADOS_ROLE', { schema: 'Originacion' })
export class ParEstadosRole {
  @PrimaryGeneratedColumn({ type: 'int', name: 'PK_PAR_ESTADOS_ROLE' })
  pkParEstadosRole: number;

  @Column('int', { name: 'FK_ESTADO' })
  fkEstado: number;

  @Column('int', { name: 'FK_SUB_ESTADO' })
  fkSubEstado: number;

  @Column('varchar', { name: 'FK_ROL', length: 50 })
  fkRol: string;
}
