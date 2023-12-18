/* eslint-disable prettier/prettier */
import { BackendRequest } from "../models/backendrequest";

export interface BackendInterfaceService {
    sendBackendRequest<T>(backendRequest: BackendRequest): Promise<T>
}