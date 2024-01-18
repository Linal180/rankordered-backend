import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/component/user/schemas/user.schema';
import { SocialProfile } from 'src/component/social-provider/schemas/SocialProfile.schema';

export type FlagRequestDocument = FlagRequest & mongoose.Document;

@Schema({ timestamps: true })
export class FlagRequest {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  })
  user?: User

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialProfile',
    autopopulate: true
  })
  profile?: SocialProfile;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected']
  })
  status: string;
}

export const FlagRequestSchema = SchemaFactory.createForClass(FlagRequest);
