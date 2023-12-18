/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosAbstract } from '../abstract/axios.abstract';
import { TrasladeRequest } from './dto/translate.dto';
import { TranslateInterfaceService } from './interfaces/translate.interface';

const Baseurl = process.env.TRANSLATE_BASE_URL;
@Injectable()
export class TranslateService extends AxiosAbstract implements TranslateInterfaceService {

    constructor(readonly httpService: HttpService) {
        super(httpService, Baseurl);
     }

    public async invokeBlaze<T>(translateRequest: TrasladeRequest): Promise<T> {

        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const response = await this.invokePost<TrasladeRequest, T>('/api/BlazeTranslator/Invoke', translateRequest, config.headers);

        return response;
    }
  
}
