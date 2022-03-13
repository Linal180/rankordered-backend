import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery, GallerySchema } from './schemas/gallery.schema';
import { GalleryV1Controller } from './v1/gallery-v1.controller';
import { GalleryV1Service } from './v1/gallery-v1.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Gallery.name, schema: GallerySchema }
        ]),
        ConfigModule
    ],
    controllers: [GalleryV1Controller],
    providers: [GalleryV1Service],
    exports: [GalleryV1Service]
})
export class GalleryModule {}
