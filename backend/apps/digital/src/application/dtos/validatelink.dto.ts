/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class ValidateLinkDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty()
    @IsDate()
    localDate: Date

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    digitalFlow: string
}