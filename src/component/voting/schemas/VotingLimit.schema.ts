import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VotingLimitDocument = VotingLimit & mongoose.Document;

@Schema({ timestamps: true })
export class VotingLimit {
    @Prop()
    userId: string | null;

    @Prop()
    ipAddress: string | null;

    @Prop()
    count: number;
}

export const VotingLimitSchema = SchemaFactory.createForClass(VotingLimit);
