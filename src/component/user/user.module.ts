import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Userv1Controller } from './v1/userv1.controller';
import { Userv1Service } from './v1/userv1.service';
import { SocialProfileModule } from '../social-provider/SocialProfile.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        SocialProfileModule
    ],
    controllers: [Userv1Controller],
    providers: [Userv1Service],
    exports: [Userv1Service]
})
export class UserModule { }
