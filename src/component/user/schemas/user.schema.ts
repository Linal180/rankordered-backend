import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../dto/UserType';

export type UserDocument = User & Document;

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
}

export const UserSchema = SchemaFactory.createForClass(User);
