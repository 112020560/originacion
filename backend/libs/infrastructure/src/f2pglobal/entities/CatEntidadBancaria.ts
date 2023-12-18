/* eslint-disable prettier/prettier */
import { Column, Entity, Index } from "typeorm"

@Index('PK_UTL_CAT_ENTIDAD', ['PK_UTL_CAT_ENTIDAD'], { unique: true })
@Entity('UTL_CAT_ENTIDAD', { schema: 'transfers' })
export class CatEntidadBancaria {
    @Column('int', { primary: true, name: 'PK_UTL_CAT_ENTIDAD' })
    PK_UTL_CAT_ENTIDAD: number
    @Column('varchar', { name: 'NOMBRE', length: 100 })
    NOMBRE: string
    @Column('varchar', { name: 'CODIGO', length: 10 })
    CODIGO: string
    @Column('varchar', { name: 'CODIGO_SECUNDARIO', length: 10 })
    CODIGO_SECUNDARIO: string
    @Column('varchar', { name: 'DESCRIPCION', length: 255 })
    DESCRIPCION: string
    @Column('bit', { name: 'PREDETERMINADO' })
    PREDETERMINADO: boolean
    @Column('bit', { name: 'VISIBLE' })
    VISIBLE: boolean
    @Column('bit', { name: 'ACTIVO' })
    ACTIVO: boolean
    @Column('int', { name: 'FK_UTL_CAT_PROVEEDOR' })
    FK_UTL_CAT_PROVEEDOR: number
    @Column('varchar', { name: 'USUARIO_CREACION' })
    USUARIO_CREACION: string
    @Column('datetime', { name: 'FECHA_CREACION' })
    FECHA_CREACION: string
    @Column('varchar', { name: 'USUARIO_MODIFICACION' })
    USUARIO_MODIFICACION: string
    @Column('datetime', { name: 'FECHA_MODIFICACION' })
    FECHA_MODIFICACION: string
    @Column('bit', { name: 'DOMICILIACION' })
    DOMICILIACION: boolean
}