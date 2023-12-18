/* eslint-disable prettier/prettier */
import { IncodeProcessFaceResponse } from '@app/infrastructure/api/incode/models/processface.model';
import { IncodeStartSessionResponse } from '@app/infrastructure/api/incode/models/startsession.model';
import { CustomResponse, GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Body, Controller, Get, Inject, Post, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { commonIncodeDto, StartDigitalFlowDto, ValidateLinkDto } from '../application/dtos';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IncodeStartSesionCommand } from '../application/cqrs/commands/incodestart.command';
import { ProcessIdCommand } from '../application/cqrs/commands/processid.command';
import { ProcessFaceCommand } from '../application/cqrs/commands/processface.command';
import { ProcessRecidenceCommand } from '../application/cqrs/commands/processrecidence.command';
import { ProcessSingCommand } from '../application/cqrs/commands/processsing.command';
import { ValidarTokenModel } from '../domain/models';
import { ValidateLinkQuery } from '../application/cqrs/queries/validatelink.query';

@ApiTags('providers')
@Controller('Digital')
export class DigitalController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBuss: QueryBus) { }

  @Version('1')
  @Post('start')
  async startSession(@Body() dto: StartDigitalFlowDto): Promise<GenericCustomResponse<IncodeStartSessionResponse>> {
    return this.commandBus.execute(new IncodeStartSesionCommand(dto))
  }

  @Version('1')
  @Post('processid')
  async processId(@Body() dto: commonIncodeDto): Promise<GenericCustomResponse<boolean>> {
    return this.commandBus.execute(new ProcessIdCommand(dto))
  }

  @Version('1')
  @Post('processface')
  async processFace(@Body() dto: commonIncodeDto): Promise<GenericCustomResponse<IncodeProcessFaceResponse>> {
    return this.commandBus.execute(new ProcessFaceCommand(dto))
  }

  @Version('1')
  @Post('processrecidence')
  async processRecidence(@Body() dto: commonIncodeDto): Promise<CustomResponse> {
    return this.commandBus.execute(new ProcessRecidenceCommand(dto))
  }

  @Version('1')
  @Post('sign')
  async processSing(@Body() dto: commonIncodeDto): Promise<CustomResponse> {
    return this.commandBus.execute(new ProcessSingCommand(dto))
  }

  @Version('1')
  @Post('validate-token')
  async vcalidateToken(@Body() dto: ValidateLinkDto): Promise<GenericCustomResponse<ValidarTokenModel>> {
    return this.queryBuss.execute(new ValidateLinkQuery(dto))
  }
}
