import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Gallery } from '../../gallery/schemas/gallery.schema';
import { Category } from '../../category/schemas/category.schema';
import { SocialProfile } from '../../social-provider/schemas/SocialProfile.schema';

type ComparisonItemDocument = ComparisonItem & mongoose.Document;

class ComparisonItemSource {
  source?: string;
  url?: string;
}

@Schema({ timestamps: true })
class ComparisonItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'Category',
    autopopulate: true
  })
  category: Category[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    autopopulate: true,
    required: true
  })
  defaultCategory: Category;

  @Prop()
  address: string;

  @Prop()
  foundedDate: string;

  @Prop()
  website: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  source?: ComparisonItemSource;

  @Prop()
  label: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallery',
    autopopulate: true,
    required: false
  })
  defaultImage?: Gallery;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: 'Gallery',
    autopopulate: true,
    required: false
  })
  images?: Gallery[];

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialProfile',
    autopopulate: true,
    required: false
  })
  profile?: SocialProfile;
}

const ComparisonItemSchema = SchemaFactory.createForClass(ComparisonItem);

export {
  ComparisonItem,
  ComparisonItemDocument,
  ComparisonItemSchema,
  ComparisonItemSource
};
