/* eslint-disable prettier/prettier */
import { FlowSteps } from '@app/infrastructure/mongodb/entities/partial-entities/flow-step.entity';
import { WorkFlowInterfaceRepository } from '@app/infrastructure/mongodb/interfaces/workflow.interface';
import { Inject, Injectable } from '@nestjs/common';
import { FlowStepInterfaceService } from '../domain/interfaces/workflow.interface';

@Injectable()
export class FlowStepService implements FlowStepInterfaceService{
  constructor(@Inject('WorkFlowInterfaceRepository') private readonly workflowService: WorkFlowInterfaceRepository) {}

  async validateStepFlow(currentFlow: FlowSteps, flow: string, methodStep: string): Promise<FlowSteps> {
    const currentStep = currentFlow.steps.pop();
    if (currentStep.status == 'FINALIZADO') {
        const configuredFlow = await this.workflowService.findOneByFilter({where: {Flow: flow}});
        if(configuredFlow) {
            const configureStep = configuredFlow.Steps.find(x => x.Step == currentStep.step);
            if(configureStep ) {
                const nextStep = configuredFlow.Steps.find(y => y.Order == (configureStep.Order + 1));
                if(nextStep.Step == methodStep) {
                    currentFlow.steps.push({
                         step: nextStep.Step,
                         status: 'INICIADO',
                         beginDate: new Date(),
                         description: `${nextStep.Step} Iniciado`   
                    })

                    return currentFlow;
                } else {
                    throw Error(`El paso ${methodStep} no es perimitido en este momento del flujo, proximo paso configurado: ${nextStep.Step}`);
                }
            } else {
                throw Error(`El paso ${currentStep.step} no se encuenta configurado`);
            }
        } else {
            throw Error(`El flujo ${flow} no se encuentra configurado`);
        }
    } else {
        if(currentStep.step == methodStep) {
            return currentFlow;
        }
        else {
            throw Error(`El paso actual iniciado ${currentStep.step} no concuerda con el paso configurado en el metodo: ${methodStep}`)
        }
    }
  }
}
