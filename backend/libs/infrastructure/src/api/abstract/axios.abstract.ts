/* eslint-disable prettier/prettier */
import { HttpService } from "@nestjs/axios";
import { BadRequestException, Logger, HttpException } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios";
import { catchError, firstValueFrom, lastValueFrom } from "rxjs";
import { DownloadModel } from "../incode/models/download.model";


export abstract class AxiosAbstract {
    private readonly logger = new Logger(AxiosAbstract.name);
    httpService: HttpService;
    baseUrl: string;
    protected constructor(httpService: HttpService, baseUrl: string) {
        this.httpService = httpService;
        this.baseUrl = baseUrl;
    }

    public async invokePost<T = any, TR = any>(endpoint: string, payload: T, headers: any): Promise<TR> {

        const url = `${this.baseUrl}${endpoint}`.replace('//', '/')
        this.logger.debug(`AxiosAbstract::invokePost => Start execute: ${url}`)

        try {

            this.logger.debug(`AxiosAbstract::invokePost => Headers: ${JSON.stringify(headers)}`)

            this.logger.debug(`AxiosAbstract::invokePost => Payload: ${JSON.stringify(payload)}`)

            //CREAMOS EL REQUEST
            const request = this.httpService.post<TR>(endpoint, payload, { baseURL: this.baseUrl, headers: headers, proxy: false })
                .pipe(
                    catchError((error: AxiosError) => {
                        this.logger.error(error);
                        console.log(error.response.data)
                        throw new BadRequestException(`Error in remote server ${url} ${error.message} Data: ${JSON.stringify(error.response.data)}`);
                    }))
            //ONTENEMOS EL RESULTADO DEL OBSERVABLE
            const response = await lastValueFrom(request)

            const { data, status, statusText } = response

            if (endpoint != '/omni/get/images') {
                this.logger.debug(`AxiosAbstract::invokePost => ${status}-${statusText} Response: ${JSON.stringify(data)}`)
            }

            return data;

        } catch (error) {
            //this.logger.error(`AxiosAbstract::invokePost => ${JSON.stringify(error)}`)
            throw new HttpException(error.message, HttpStatusCode.InternalServerError);
        } finally {
            this.logger.debug(`AxiosAbstract::invokePost => End execute: ${url}`)
        }


    }

    public async invokeGet<TR = any>(endpoint: string, headers: any): Promise<TR> {

        const url = `${this.baseUrl}${endpoint}`.replace('//', '/')
        this.logger.debug(`AxiosAbstract::invokePost => Start execute: ${url}`)

        try {

            this.logger.debug(`AxiosAbstract::invokePost => Headers: ${JSON.stringify(headers)}`)

            //CREAMOS EL REQUEST
            const request = this.httpService.get<TR>(endpoint, { baseURL: this.baseUrl, headers: headers, proxy: false })
                .pipe(
                    catchError((error: AxiosError) => {
                        this.logger.error(error);
                        console.log(error.response.data)
                        throw new BadRequestException(`Error in remote server ${url} ${error.message} Data: ${JSON.stringify(error.response.data)}`);
                    }))
            //ONTENEMOS EL RESULTADO DEL OBSERVABLE
            const response = await lastValueFrom(request)

            const { data, status, statusText } = response

            this.logger.debug(`AxiosAbstract::invokePost => ${status}-${statusText} Response: ${JSON.stringify(data)}`)

            return data;

        } catch (error) {
            //this.logger.error(`AxiosAbstract::invokePost => ${JSON.stringify(error)}`)
            throw new HttpException(error.message, HttpStatusCode.InternalServerError);
        } finally {
            this.logger.debug(`AxiosAbstract::invokePost => End execute: ${url}`)
        }


    }

    public axiosDowloadFile = async (fileUrl: string): Promise<DownloadModel> => {
        console.log(fileUrl);
        const request = this.httpService.get(fileUrl, { responseType: 'arraybuffer', baseURL: fileUrl, headers: { 'Content-Type': 'image/png' } });
        const response = await lastValueFrom(request);
        // const { data, status, statusText } = response;
        console.log(response.data)
        const type = response.headers['content-type']
        console.log(type)
        const blob = new Blob([response.data], { type: type })
        return {
            contentType: type,
            fileContent: response.data
        }
    }
}