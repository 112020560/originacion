/* eslint-disable prettier/prettier */
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateLinkDto } from '../../dtos';
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { ValidarTokenModel } from 'apps/digital/src/domain/models';
import { Inject } from '@nestjs/common';
import { IValidateLinkService } from 'apps/digital/src/domain/interfaces';
export class ValidateLinkQuery implements IQuery {
    constructor(public readonly dto: ValidateLinkDto) {}
}

@QueryHandler(ValidateLinkQuery)
export class ValidateLinkHandler implements IQueryHandler<ValidateLinkQuery, GenericCustomResponse<ValidarTokenModel>> {
    constructor(
        @Inject('IValidateLinkService')
        private readonly _service: IValidateLinkService
    ) {}
    async execute(query: ValidateLinkQuery): Promise<GenericCustomResponse<ValidarTokenModel>> {
        return {
            Success: true,
            Message: 'Custom token validation',
            Data: await this._service.validateLink(query.dto)
        }
    }

}