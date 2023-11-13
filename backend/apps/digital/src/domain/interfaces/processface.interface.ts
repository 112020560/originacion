/* eslint-disable prettier/prettier */
import { IncodeProcessFaceResponse } from "@app/infrastructure/api/incode/models/processface.model";
import { commonIncodeDto } from "../../application/dtos";


export  interface IProcessFaceServices {
    incodeProcessFace(dto: commonIncodeDto): Promise<IncodeProcessFaceResponse> ;
} 