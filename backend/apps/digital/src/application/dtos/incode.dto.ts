/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
export class commonIncodeDto {
    @ApiProperty()
    token?: string | null;
    @ApiProperty()
    fechaLocal?: Date;
    @ApiProperty()
    interviewId?: string | null;
    @ApiProperty()
    apiKey?: string | null;
    @ApiProperty()
    flujo?: string | null;
}