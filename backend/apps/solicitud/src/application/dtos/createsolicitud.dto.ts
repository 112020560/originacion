/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
export class CreateSolicitudDto {
  @ApiProperty({name: 'id_solicitud'})
  Id_Solicitud: number;
  @ApiProperty()
  fechaLocal: number;
  @ApiProperty()
  usuario: string | null;
  @ApiProperty()
  pais: number;
  @ApiProperty()
  estado: number;
  @ApiProperty()
  subEstado: number;
  @ApiProperty()
  curp: string | null;
  @ApiProperty()
  rfc: string | null;
  @ApiProperty()
  sessionId: string | null;
  @ApiProperty()
  propietario: string | null;
  @ApiProperty()
  supervisor: string | null;
  @ApiProperty()
  tipoCommando: string | null;
  @ApiProperty()
  correoElectronico: string | null;
  @ApiProperty()
  telefonoPrincipal: string | null;

  public convertToDate(): Date {
    return new Date(this.fechaLocal);
  }
}
