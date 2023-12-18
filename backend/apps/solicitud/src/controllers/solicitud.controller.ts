/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Query, Version, HttpException, Param, Post, Body, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { LogAccionQuery } from '../application/CQRS/queries/logaccion.query';
import { SolicitudQuery } from '../application/CQRS/queries/solicitud.query';
import { CreateSolicitudDto } from '../application/dtos/createsolicitud.dto';
import { ConsultParamsDto } from '../application/dtos/queries.params.dto';
import { CreateSolicitudCommand } from '../application/CQRS/commands/createsolicitud.command';
import { MtrSolicitud } from '@app/infrastructure/f2pglobal/entities/MtrSolicitud.entity';
import { UpdateOwnerDto } from '../application/dtos/updateowner.dto';
import { UpdateOwnerCommand } from '../application/CQRS/commands/updateowner.command';
import * as client from 'amqplib'
import  { Channel, Connection } from  'amqplib'

@ApiTags('solicitudes')
@Controller('Solicitud')
export class SolicitudController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) { }

  @Version('1')
  @Get()
  async findByQuery(@Query() query: ConsultParamsDto): Promise<MtrSolicitud[]> {
    return this.queryBus.execute(new SolicitudQuery(query));
  }

  @Version('1')
  @Get('log-eventos/:id_solicitud')
  async findEvents(@Param('id_solicitud') id_solicitud: number): Promise<MtrSolicitud[]> {
    console.log(id_solicitud);
    return this.queryBus.execute(new LogAccionQuery(id_solicitud));
  }

  @Version('1')
  @HttpCode(201)
  @Post()
  async createSolicitud(@Body() createSolicitudDto: CreateSolicitudDto) {
    return this.commandBus.execute(new CreateSolicitudCommand(createSolicitudDto));
  }

  @Version('1')
  @HttpCode(201)
  @Post('propietario')
  async updateOwner(@Body() createSolicitudDto: UpdateOwnerDto) {
    return this.commandBus.execute(new UpdateOwnerCommand(createSolicitudDto));
  }
  @Version('1')
  @Get('test-amqplib')
  async test(@Query() query: ConsultParamsDto): Promise<void> {
    const connection: Connection = await client.connect('amqp://admin:Abc..123@localhost:5672/transactions', { name: 'Solicitud-Microservice' })
    // Create a channel
    const channel: Channel = await connection.createChannel()
    await channel.assertExchange("sign.events", "topic", { durable: true, autoDelete: false, arguments: null });
    channel.publish("sign.events", "topic", Buffer.from(JSON.stringify({prueba: 'chifri playo'})))
    connection.close();
  }
}
