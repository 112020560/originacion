/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";


export class DocumentInformationDto {
  @ApiProperty({name: 'NombreDocumento'})
  nombreDocumento?: string;
  @ApiProperty({name: 'ContenidoDocumento'})
  contenidoDocumento?: string;
  @ApiProperty({name: 'TipoDocumento'})
  tipoDocumento?: string;
}

export class BankAccountInformationDto {
  @ApiProperty()
  cuentaInterbancaria?: string;
  @ApiProperty()
  codigoBanco?: string;
  @ApiProperty()
  TipoCuenta?: number;
}

export class UploadDocumentDto {
  @ApiProperty({ name: 'Id_Solicitud' })
  id_Solicitud?: number;
  @ApiProperty({ name: 'FechaLocal' })
  fechaLocal?: Date;
  @ApiProperty({ name: 'Usuario' })
  usuario?: string;
  @ApiProperty({ name: 'Tipo' })
  tipo?: string;
  @ApiProperty({ name: 'Token' })
  token?: string;
  @ApiProperty({ name: 'Documento', type: () => DocumentInformationDto })
  documento?: DocumentInformationDto;
  @ApiProperty({ name: 'Cuenta', type: () => BankAccountInformationDto })
  cuenta?: BankAccountInformationDto
}