/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Controller, Post, Body, Version } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateLinkCommand } from '../application/CQRS/commands/createurl.command';
import { CreateLinkDto } from '../application/dtos/createlink.dto';
import { LinkResponse } from '../domain/models/linkresponse.model';

@ApiTags('link')
@Controller('Digital')
export class UrlController {
  constructor(private readonly commandBus: CommandBus) {}

  @Version('1')
  @Post('link-page')
  async creatUrl(@Body() linkDto: CreateLinkDto) {
    return this.commandBus.execute<CreateLinkCommand,GenericCustomResponse<LinkResponse>>(new CreateLinkCommand(linkDto))
  }
}
