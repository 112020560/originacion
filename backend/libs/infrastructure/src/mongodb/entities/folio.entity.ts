/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Buro } from './partial-entities/buro.entoty';
import { Digital } from './partial-entities/digital.entity';
import { FlowSteps } from './partial-entities/flow-step.entity';
import { KyC } from './partial-entities/kyc.entity';
import { Offer } from './partial-entities/offer.entity';

export type FolioDocument = Folio & Document;

@Schema({ collection: 'Folio' })
export class Folio {
    id?: string;
    @Prop()
    id_request: number;
    @Prop()
    country: number;
    @Prop()
    status: string;
    @Prop()
    subStatus: string;
    @Prop()
    unixRequestDate: number;
    @Prop()
        requestDate: Date;
    @Prop()
    owner: string;
    @Prop()
    supervisor: string;
    @Prop()
    updateDate: Date;
    @Prop()
    createDate: Date;
    @Prop()
    userCreate: string;
    @Prop()
    userUpdate: string;
    @Prop(() => KyC)
    kyc: KyC;
    @Prop(() => Offer)
    offer: Offer[]
    @Prop()
    digitalSesion: string;
    @Prop(() => Digital)
    flujoDigital: Digital[]
    @Prop(() => Buro)
    buro: Buro[];
    @Prop(() => FlowSteps)
    flowSteps: FlowSteps[]
    @Prop()
    bank: string;
    @Prop()
    accountBank: string
    @Prop()
    externalId: string;
}


export const FolioSchema = SchemaFactory.createForClass(Folio)

