import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as Mongoose from 'mongoose';

export type ItemScoreDocument = ItemScore & Mongoose.Document;

@Schema({ timestamps: true })
export class ItemScore {
  @Prop({ type: Mongoose.Schema.Types.ObjectId, required: true })
  itemId: string;

  @Prop({ type: Mongoose.Schema.Types.ObjectId, required: true })
  categoryId: string;

  @Prop({ required: true })
  score: number;
}

export const ItemScoreSchema = SchemaFactory.createForClass(ItemScore);
