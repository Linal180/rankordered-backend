import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type CategoryDocument = Category & mongoose.Document;

@Schema()
class CategoryRankingItem {
    @Prop({ required: true })
    itemId: string;

    @Prop({
        type: mongoose.Types.ObjectId,
        ref: 'ScoreSnapshot'
    })
    scoreSnapshot: string[];
}

const CategoryRankingItemSchema =
    SchemaFactory.createForClass(CategoryRankingItem);

@Schema({ timestamps: true })
export class Category {
    @Prop()
    name: string;

    @Prop()
    slug: string;

    @Prop({ default: true })
    active: boolean;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        autopopulate: true
    })
    parent?: Category = null;

    @Prop({
        type: [CategoryRankingItemSchema],
        autopopulate: false,
        select: false
    })
    categoryRankingItems: CategoryRankingItem[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
