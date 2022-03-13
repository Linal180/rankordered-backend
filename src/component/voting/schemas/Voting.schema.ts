import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VotingDocument = Voting & mongoose.Document;

@Schema({ timestamps: true })
export class Voting {
    @Prop()
    contestantId: string;

    @Prop()
    contestantPreviousSCore: number;

    @Prop()
    contestantCurrentSCore: number;

    @Prop()
    opponentId: string;

    @Prop()
    opponentPreviousScore: number;

    @Prop()
    opponentCurrentSCore: number;

    @Prop()
    categoryId: string;

    @Prop()
    winnerId: string;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
