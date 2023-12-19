import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ComparisonItem } from 'src/component/comparisonItem/schemas/ComparisonItem.schema';
import { User } from 'src/component/user/schemas/user.schema';

@Schema()
export class FavoriteItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ComparisonItem' })
  comparisonItem: ComparisonItem;
}

export type FavoriteItemDocument = FavoriteItem & mongoose.Document;
export const FavoriteItemSchema = SchemaFactory.createForClass(FavoriteItem);
