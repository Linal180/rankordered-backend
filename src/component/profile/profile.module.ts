import { Module } from '@nestjs/common';
import { ProfileV1Controller } from './v1/profile-v1.controller';
import { UserModule } from '../user/user.module';
import { SocialProfileV1Service } from '../social-provider/v1/social-profile-v1.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialProfile, SocialProfileSchema } from '../social-provider/schemas/SocialProfile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: SocialProfile.name, schema: SocialProfileSchema }]),
        UserModule],
    controllers: [ProfileV1Controller],
    providers: [SocialProfileV1Service],
    exports: [SocialProfileV1Service]
})
export class ProfileModule { }
