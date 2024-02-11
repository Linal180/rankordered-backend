import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Userv1Controller } from './v1/userv1.controller';
import { Userv1Service } from './v1/userv1.service';
import { SocialProfileModule } from '../social-provider/SocialProfile.module';
import { CategoryModule } from '../category/category.module';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        SocialProfileModule,
        GalleryModule,
        forwardRef(() => CategoryModule),
    ],
    controllers: [Userv1Controller],
    providers: [Userv1Service],
    exports: [Userv1Service]
})
export class UserModule { }
