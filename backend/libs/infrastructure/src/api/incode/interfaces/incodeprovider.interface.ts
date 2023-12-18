/* eslint-disable prettier/prettier */
import { IncodeAppeoveRequest } from "../models/approve.request";
import { IncodeAppeoveResponse } from "../models/approve.response";
import { DownloadModel } from "../models/download.model";
import { FinishStatusResponse } from "../models/finishstatus.response";
import { GenericPayload } from "../models/generic.payload";
import { IncodeImagesResponse } from "../models/images.response";
import { IncodeRequests } from "../models/incode.request";
import { IncodeOcrDataResponse } from "../models/ocrdata.response";
import { IncodeProcessFaceResponse } from "../models/processface.model";
import { IncodeProcessGovernmentResponse, IncodeScoreResponse } from "../models/processgovernmentresponse";
import { ProcesosIncodeModel } from "../models/processid.model";
import { ProcessIdResponse } from "../models/processid.response";
import { IncodeStartSessionResponse } from "../models/startsession.model";

export interface IncodeProviderInterfaceService {
    startSessionAsync(payload: any): Promise<IncodeStartSessionResponse>;
    processIdAsync(genericPayload: GenericPayload<ProcesosIncodeModel>): Promise<ProcessIdResponse> 
    processFaceAsync(genericPayload: GenericPayload<any>): Promise<IncodeProcessFaceResponse>;
    processGovernmentAsync(genericPayload: GenericPayload<any>): Promise<IncodeProcessGovernmentResponse>;
    getScoreAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeScoreResponse>;
    getOcrDataAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeOcrDataResponse>;
    getImagesAsync(genericPayload: GenericPayload<IncodeRequests>): Promise<IncodeImagesResponse>;
    processApproveAsync(genericPayload: GenericPayload<IncodeAppeoveRequest>): Promise<IncodeAppeoveResponse>;
    finishStatusAsync(genericPayload: GenericPayload<any>): Promise<FinishStatusResponse>;
    dowloadFile(urlFile: string):Promise<DownloadModel>;
}