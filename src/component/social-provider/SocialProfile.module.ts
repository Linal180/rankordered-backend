import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialProfileV1Controller } from './v1/social-profile-v1.controller';
import { SocialProfileV1Service } from './v1/social-profile-v1.service';
import { SocialProfile, SocialProfileSchema } from './schemas/SocialProfile.schema';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { ComparisonItemModule } from '../comparisonItem/comparison-item.module';
import { FlagRequestModule } from '../flag-request/index.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: SocialProfile.name, schema: SocialProfileSchema }]),
		forwardRef(() => UserModule),
		forwardRef(() => CategoryModule),
		forwardRef(() => ComparisonItemModule),
		forwardRef(() => FlagRequestModule),
	],

	providers: [SocialProfileV1Service],
	controllers: [SocialProfileV1Controller],
	exports: [SocialProfileV1Service]
})
export class SocialProfileModule { }
