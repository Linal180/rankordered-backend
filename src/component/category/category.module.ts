import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryV1Controller } from './v1/category-v1.controller';
import { CategoryV1Service } from './v1/category-v1.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Category.name, schema: CategorySchema }
        ])
    ],
    providers: [CategoryV1Service],
    controllers: [CategoryV1Controller],
    exports: [CategoryV1Service]
})
export class CategoryModule {}
