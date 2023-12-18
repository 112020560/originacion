/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, Body, Put, Delete, Version, HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GenerateOtpCommand } from '../application/CQRS/commands/generateotp.command';
import { OtpGenerateDto } from '../application/dtos/otpgenerate.dto';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Version('1')
  @HttpCode(200)
  @Post()
  async creatOtp(@Body() otpDto: OtpGenerateDto) {
    return this.commandBus.execute(new GenerateOtpCommand(otpDto))
  }
}
