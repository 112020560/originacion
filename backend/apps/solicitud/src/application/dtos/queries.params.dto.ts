/* eslint-disable prettier/prettier */
import { ApiProperty, } from "@nestjs/swagger";

export class ConsultParamsDto {
  @ApiProperty()
  Estado: number;
  //@IsOptional()
  @ApiProperty()
  SubEstado: number;
  @ApiProperty()
  Pais: number;
  @ApiProperty({name:'Propietario' ,default: null, required: false })
  Propietario?: string | null;
  @ApiProperty({default: null, required: false })
  Supervisor?: string | null;

  take: number;
  page: number;
}
