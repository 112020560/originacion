/* eslint-disable prettier/prettier */
import { UpdateContract } from "@app/shared/contracts/update.contract";
import { UpdateStatusContract } from "@app/shared/contracts/updatestatus.contract";

export interface SolicitudInterfaceRepository {
    updateStatus(updatestatusDto: UpdateStatusContract): Promise<void>;
    updateInformation(updateContract: UpdateContract): Promise<void>;
}