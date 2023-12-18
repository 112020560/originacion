/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { IncodeStartSessionResponse } from './models/startsession.model';
import { lastValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { GenericPayload } from './models/generic.payload';
import { ProcesosIncodeModel } from './models/processid.model'
import { IncodeProcessFaceResponse } from './models/processface.model';
import { IncodeProcessGovernmentResponse, IncodeScoreResponse } from './models/processgovernmentresponse';
import { ImagesReq, IncodeRequests } from './models/incode.request';
import { IncodeOcrDataResponse } from './models/ocrdata.response';
import { IncodeImagesResponse } from './models/images.response';
import { IncodeAppeoveRequest } from './models/approve.request';
import { IncodeAppeoveResponse } from './models/approve.response';
import { FinishStatusResponse } from './models/finishstatus.response';
import { IncodeProviderInterfaceService } from './interfaces/incodeprovider.interface';
import { AxiosAbstract } from '../abstract/axios.abstract';
import { ProcessIdResponse } from './models/processid.response';
import { DownloadModel } from './models/download.model';

@Injectable()
export class IncodeProviderService extends AxiosAbstract implements IncodeProviderInterfaceService {
    private readonly Baseurl = process.env.INCODE_BASE_URL;
    private readonly ApiKey = process.env.INCODE_API_KEY;
    
    constructor(readonly httpService: HttpService) {
        const baseUrl = process.env.INCODE_BASE_URL;
        console.log(baseUrl);
        super(httpService, baseUrl);
     }

    public async startSessionAsync(payload: any): Promise<IncodeStartSessionResponse> {
        //const url = `${this.Baseurl}/omni/start`
        const headers = {
            headers: {
                'Content-Type': 'application/json',
                'api-version': '1.0',
                'x-api-key': this.ApiKey
            }
        };

        // const { data } = await lastValueFrom(
        //     this.httpService.post<IncodeStartSessionResponse>(url, payload, headers)
        //         .pipe(catchError((error: AxiosError) => {
        //             throw new Error(`Unable to start session with inCode API ${JSON.stringify({ error })}`);
        //         }))
        // )
        const response = await this.invokePost<IncodeStartSessionResponse>('/omni/start', payload, headers.headers)

        return response;
    }

    public async processIdAsync(genericPayload: GenericPayload<ProcesosIncodeModel>): Promise<ProcessIdResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/process/id?queueName=${genericPayload.payload.InterviewId}`
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            };
            const response = await this.invokePost<any, ProcessIdResponse>(endpoint, {}, headers.headers)
            return response;
        } else {
            return {
                success: false
            }
        }
    }

    public async processFaceAsync(genericPayload: GenericPayload<any>): Promise<IncodeProcessFaceResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/process/face?imageType=selfie`
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }

            return await this.invokePost<any, IncodeProcessFaceResponse>(endpoint, genericPayload.payload, headers.headers)
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async processGovernmentAsync(genericPayload: GenericPayload<any>): Promise<IncodeProcessGovernmentResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/process/government-validation?fallbackEnabled=false&scrapingMethod=true`
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }
            return await this.invokePost<any, IncodeProcessGovernmentResponse>(endpoint, null, headers.headers)
        } else {
            throw Error('Unable to start session with inCode API')
        }
    }

    public async getScoreAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeScoreResponse> {
        const payload = genericPayload.payload;

        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/get/score?id=${payload.Id_Sesion}`
            const headers = {
                headers: {
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }

            return await this.invokeGet<IncodeScoreResponse>(endpoint, headers.headers);
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async getOcrDataAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeOcrDataResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/get/ocr-data/v2`
            const headers = {
                headers: {
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }

    
            const response = await this.invokeGet<IncodeOcrDataResponse>(endpoint, headers.headers)
            return response;
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async getImagesAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeImagesResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = '/omni/get/images'//`/omni/get/images/v2`
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }
            return await this.invokePost<ImagesReq, IncodeImagesResponse>(endpoint, genericPayload.payload.ImagesReq, headers.headers);
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async processApproveAsync(genericPayload: GenericPayload<IncodeAppeoveRequest>): Promise<IncodeAppeoveResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const url = `${this.Baseurl}/omni/process/approve?interviewId=${genericPayload.payload.interviewId}`
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }

            const { data } = await lastValueFrom(
                this.httpService.post<IncodeAppeoveResponse>(url, genericPayload.payload.approveComponents, headers)
                    .pipe(catchError((error: AxiosError) => {
                        throw new Error(`Unable to process Approve with inCode API ${JSON.stringify({ error })}`);
                    }))
            );

            return data;
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async finishStatusAsync(genericPayload: GenericPayload<any>): Promise<FinishStatusResponse> {
        const oauth = await this.startSessionAsync(genericPayload.oauthPayload);
        if (oauth) {
            const endpoint = `/omni/finish-status`
            const headers = {
                headers: {
                    'api-version': '1.0',
                    'x-api-key': this.ApiKey,
                    'X-Incode-Hardware-Id': oauth.token
                }
            }

            // const { data } = await lastValueFrom(
            //     this.httpService.get<FinishStatusResponse>(url, headers)
            //         .pipe(catchError((error: AxiosError) => {
            //             throw new Error(`Unable to process finishStatus with inCode API ${JSON.stringify({ error })}`);
            //         }))
            // );

            // return data;
            return this.invokeGet<FinishStatusResponse>(endpoint, headers.headers)
        } else {
            throw new Error('Unable to start session with inCode API')
        }
    }

    public async dowloadFile(urlFile: string): Promise<DownloadModel> {
        return await this.axiosDowloadFile(urlFile);
    }
}
