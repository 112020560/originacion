/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { GenericDto } from './generic.dto';
export class StartDigitalFlowDto extends GenericDto{
    @ApiProperty()
    id_Sesion?: string;
    @ApiProperty()
    token?: string;
    flujo: string;
}