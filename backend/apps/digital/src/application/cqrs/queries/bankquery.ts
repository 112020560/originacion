/* eslint-disable prettier/prettier */
import { GenericCustomResponse } from '@app/shared/wrappers/response.wrapper';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ICatalogServices } from 'apps/digital/src/domain/interfaces/catalog.interface';
import { CatalogoGenericoModel } from 'apps/digital/src/domain/models';
export class BankQuery implements IQuery {
    constructor(public readonly typeQuery: string) { }
}
@QueryHandler(BankQuery)
export class BankQueryHandler implements IQueryHandler<BankQuery, GenericCustomResponse<Array<CatalogoGenericoModel>>>{
    constructor(
        @Inject('ICatalogServices')
        private readonly catalogService: ICatalogServices) { }
    async execute(query: BankQuery): Promise<GenericCustomResponse<Array<CatalogoGenericoModel>>> {
        switch (query.typeQuery) {
            case 'banks':
                const banks = await this.catalogService.getCatEntidadBancaria();
                const mpp: Array<CatalogoGenericoModel> = banks.map(catalog => {
                    return {
                        codigo: catalog.PK_UTL_CAT_ENTIDAD.toString(),
                        codigo_secundario: catalog.CODIGO_SECUNDARIO,
                        descripcion: catalog.DESCRIPCION
                    };
                })
                return {
                    Success: true,
                    Message: null,
                    Errors: null,
                    Data: mpp
                }
             case 'status':
                const status = await this.catalogService.getEstadosSolicitud();
                return {
                    Success: true,
                    Message: null,
                    Errors: null,
                    Data: (status.map(status => ({codigo: status.pkEstadoSolicitud.toString(), codigo_secundario: '0', descripcion: status.estado})))
                }
                case 'substatus':
                    const substatus = await this.catalogService.getSubEstadosSolicitud();
                    return {
                        Success: true,
                        Message: null,
                        Errors: null,
                        Data: (substatus.map(status => ({codigo: status.pkSubestadoSolicitud.toString(), codigo_secundario: status.fkEstado.pkEstadoSolicitud.toString(), descripcion: status.subEstado})))
                    }
            default:
                return {
                    Success: false,
                    Message: 'The catalog doest not exist'
                }
        }

    }
}