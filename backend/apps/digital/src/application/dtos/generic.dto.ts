/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export abstract class GenericDto {
    @ApiProperty()
    id_Solicitud: number;
    @ApiProperty()
    fechaLocal: Date;
    @ApiProperty()
    usuario: string | null;
}