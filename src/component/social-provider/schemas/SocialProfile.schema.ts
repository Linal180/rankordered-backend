import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Category } from 'src/component/category/schemas/category.schema';

export type SocialProfileDocument = SocialProfile & mongoose.Document;

@Schema({ timestamps: true })
export class SocialProfile {
	@Prop({ required: true, enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'pinterest', 'snapchat'] })
	provider: string;

	@Prop({ required: true })
	email: string;

	@Prop()
	primary: boolean;

	@Prop()
	isFavorite: boolean;

	@Prop({
		required: true,
		default: 'no',
		enum: ['no', 'pending', 'approved', 'rejected', 'submitted']
	})
	flag: string;

	@Prop({ required: true })
	userId: string;

	@Prop()
	username: string;

	@Prop({ type: String, required: false })
	profilePicture: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
	})
	category: Category;
}

export const SocialProfileSchema = SchemaFactory.createForClass(SocialProfile);
