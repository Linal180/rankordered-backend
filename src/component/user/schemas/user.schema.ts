import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../dto/UserType';
import { FavoriteItem } from 'src/component/favorite-item/schemas/favoriteItem.schema';

export type UserDocument = User & mongoose.Document;

@Schema({ timestamps: true })
export class User {
    @Prop()
    name: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true })
    type: UserType;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FavoriteItem' }] })
    favoriteItems: FavoriteItem[];
}

export const UserSchema = SchemaFactory.createForClass(User);
