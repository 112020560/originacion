/* eslint-disable prettier/prettier */
import { TrasladeRequest } from "../dto/translate.dto";

export interface TranslateInterfaceService {
    invokeBlaze<T>(translateRequest: TrasladeRequest): Promise<T>
}