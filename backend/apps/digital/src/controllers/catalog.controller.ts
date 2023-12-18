/* eslint-disable prettier/prettier */
import { Controller, Get, Version } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { QueryBus } from '@nestjs/cqrs';
import { BankQuery } from "../application/cqrs/queries/bankquery";

@ApiTags('Catalogo')
@Controller('Catalogo')
export class CatalogController {
    constructor(
        private readonly queryBus: QueryBus
    ) { }

    @Version('1')
    @Get('entidad-bancaria')
    async getCatalogBank() {
        return this.queryBus.execute(new BankQuery('banks'))
    }

    @Version('1')
    @Get('estados')
    async getStatus() {
        return this.queryBus.execute(new BankQuery('status'))
    }

    @Version('1')
    @Get('subestados')
    async getSubStatusk() {
        return this.queryBus.execute(new BankQuery('substatus'))
    }
}