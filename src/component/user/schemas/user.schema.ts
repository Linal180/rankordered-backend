import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../dto/UserType';
import { FavoriteItem } from 'src/component/favorite-item/schemas/favoriteItem.schema';
import { Gallery } from 'src/component/gallery/schemas/gallery.schema';

export type UserDocument = User & mongoose.Document;

@Schema({ timestamps: true })
export class User {
    @Prop()
    name: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: false })
    password: string;

    @Prop({ required: false })
    token: string;

    @Prop({ required: true })
    type: UserType;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery',
        autopopulate: true,
        required: false
    })
    profilePicture?: Gallery;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FavoriteItem' }] })
    favoriteItems: FavoriteItem[];
}

export const UserSchema = SchemaFactory.createForClass(User);
