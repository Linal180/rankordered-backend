import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/component/user/schemas/user.schema';

export type SocialProfileDocument = SocialProfile & mongoose.Document;

@Schema({ timestamps: true })
export class SocialProfile {
	@Prop({ required: true, enum: ['instagram', 'tiktok', 'youtube'] })
	provider: string;

	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	primary: boolean;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		autopopulate: true,
		required: true
	})
	userId: User;

	@Prop({ type: String, required: true })
	profilePicture: string;
}

export const SocialProfileSchema = SchemaFactory.createForClass(SocialProfile);
