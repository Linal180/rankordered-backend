import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type SocialProfileDocument = SocialProfile & mongoose.Document;

@Schema({ timestamps: true })
export class SocialProfile {
	@Prop({ required: true, enum: ['instagram', 'tiktok', 'youtube', 'twitter'] })
	provider: string;

	@Prop({ required: true })
	email: string;

	@Prop()
	primary: boolean;

	@Prop()
	isFavorite: boolean;

	@Prop({ required: true })
	userId: string;

	@Prop()
	username: string;

	@Prop({ type: String, required: true })
	profilePicture: string;
}

export const SocialProfileSchema = SchemaFactory.createForClass(SocialProfile);
