import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FileType } from './FiletType';
import { ImageSource } from './ImageSource';

export type GalleryDocument = Gallery & mongoose.Document;

@Schema({ timestamps: true })
export class Gallery {
    @Prop()
    name: string;

    @Prop()
    slug: string;

    @Prop()
    path: string;

    @Prop()
    type: FileType;

    @Prop({ required: false })
    source?: ImageSource;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
