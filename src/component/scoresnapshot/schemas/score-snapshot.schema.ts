import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';

export type ScoreSnapshotDocument = ScoreSnapshot & Mongoose.Document;

@Schema({ timestamps: true })
export class ScoreSnapshot {
    @Prop({ type: Mongoose.Schema.Types.ObjectId, required: true })
    itemId: string;

    @Prop({ type: Mongoose.Schema.Types.ObjectId, required: true })
    categoryId: string;

    @Prop({ required: true })
    score: number;

    @Prop({ required: true })
    ranking: number;

    @Prop({ required: true })
    date: Date;
}

export const ScoreSnapshotSchema = SchemaFactory.createForClass(ScoreSnapshot);
