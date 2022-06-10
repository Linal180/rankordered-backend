import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type CategoryDocument = Category & mongoose.Document;

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
}

export const CategorySchema = SchemaFactory.createForClass(Category);
