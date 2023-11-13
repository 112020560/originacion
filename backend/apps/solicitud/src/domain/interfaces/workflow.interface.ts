/* eslint-disable prettier/prettier */
import { FlowSteps } from "@app/infrastructure/mongodb/entities/partial-entities/flow-step.entity";

export interface FlowStepInterfaceService {
    validateStepFlow(currentFlow: FlowSteps, flow: string, methodStep: string): Promise<FlowSteps>
}