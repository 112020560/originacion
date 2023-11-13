/* eslint-disable prettier/prettier */
import { Prop } from "@nestjs/mongoose";

export class FlowSteps {
    @Prop()
    flow: string;
    @Prop()
    steps: Steps[];
}


export class Steps {
    @Prop()
    step: string;
    @Prop()
    status: string;
    @Prop()
    beginDate: Date;
    @Prop()
    endDate?: Date;
    @Prop()
    duration?: number;
    @Prop()
    description?: string;
}
