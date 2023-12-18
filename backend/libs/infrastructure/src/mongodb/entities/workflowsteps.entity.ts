/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkFlowStepDocument = HydratedDocument<WorkFlowStep>;

@Schema({ collection: 'WorkFlowStep' })
export class WorkFlowStep {
  id?: string;
  @Prop()
  Flow: string;
  @Prop(() => FlowStep)
  Steps: FlowStep[];
}

export class FlowStep {
  @Prop()
  Order: number;
  @Prop()
  Step: string;
  @Prop()
  IsParent: boolean;
  @Prop()
  IsChild: boolean;
  @Prop()
  Parent: string;
}

export const WorkFlowSchema = SchemaFactory.createForClass(WorkFlowStep);
