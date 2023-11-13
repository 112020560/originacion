/* eslint-disable prettier/prettier */
import { BackendDataBase } from '@app/shared/enums/backendmethod.enum';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';
import { BackendInterfaceService } from './interfaces/backend.interface';
import { BackendRequest } from './models/backendrequest';
import { BackEndResponse } from './models/backendresponse';

@Injectable()
export class BackendService implements BackendInterfaceService {
    private readonly logger = new Logger(BackendService.name);
    private readonly Baseurl = process.env.BACKEND_BASE_URL;
    private readonly Tenant = process.env.BACKEND_TENANT;
    private readonly Version = process.env.BACKEND_VERSION

    constructor(private readonly httpService: HttpService) { }

    public async sendBackendRequest<T>(backendRequest: BackendRequest): Promise<T> {
        const url = `${this.Baseurl}/api/${this.Version}/backend/${this.Tenant}/${backendRequest.Metodo.toString().toLowerCase()}`
        this.logger.debug(`Send request to ${url}`)
        const request = {
            Metodo: backendRequest.Metodo.toString(),
            Conexion: backendRequest.Engine.toString(),
            Message: null,
            LlaveBaseDatos: backendRequest.DataBase == BackendDataBase.CORE ?
                `${backendRequest.Country.toUpperCase()}_${backendRequest.DataBase.toString().toUpperCase()}`
                : `${backendRequest.DataBase.toString().toUpperCase()}_${backendRequest.Country.toUpperCase()}`,
            Procedimiento: backendRequest.Procedimiento,
            Flag: backendRequest.Flag,
            AppKey: backendRequest.ApplicationId,
            Params: backendRequest.Params
        }

        this.logger.debug(`Payload: ${JSON.stringify(request)}`);

        try {
            const { data } = await lastValueFrom(
                this.httpService.post<BackEndResponse<T>>(url, request, { headers: { 'Content-Type': 'application/json' } })
                    .pipe(catchError((error: AxiosError) => {
                        this.logger.error(error.response.data);
                        throw (`Error in remote server ${url} ${error.message} Data: ${JSON.stringify(error.response.data)}`);
                    }))
            )

            this.logger.debug(`Response: ${JSON.stringify(data)}`);

            if (data.ResponseCode.toUpperCase() == 'OK') {
                return data.ResponseData;
            } else {
                throw data.ErrorMessage;
            }
        } catch (error) {
            const errorMessage= error;
            this.logger.error(errorMessage)
            throw Error(errorMessage);
        }



    }
}
