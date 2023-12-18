/* eslint-disable prettier/prettier */
import { GenericDto } from './generic.dto';
import { ApiProperty } from "@nestjs/swagger";
export class DownloadFileDto extends GenericDto {
    @ApiProperty()
    filePath: string;
    @ApiProperty()
    fileName: string;
}
