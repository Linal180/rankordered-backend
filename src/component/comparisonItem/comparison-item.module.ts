import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ComparisonItem,
    ComparisonItemSchema
} from './schemas/ComparisonItem.schema';
import { ComparisonItemV1Service } from './v1/comparison-item-v1.service';
import { ComparisonItemV1Controller } from './v1/comparison-item-v1.controller';
import {
    ItemScore,
    ItemScoreSchema
} from '../item-score/schemas/item-score.schema';
import { ItemScoreModule } from '../item-score/item-score.module';
import { CollegeQueueConsumer } from './consumer/CollegeQueue.consumer';
import { BullModule } from '@nestjs/bull';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ComparisonItem.name, schema: ComparisonItemSchema },
            { name: ItemScore.name, schema: ItemScoreSchema }
        ]),
        BullModule.registerQueue({ name: 'college_migration' }),
        GalleryModule,
        ItemScoreModule
    ],
    providers: [ComparisonItemV1Service, CollegeQueueConsumer],
    controllers: [ComparisonItemV1Controller],
    exports: [ComparisonItemV1Service]
})
export class ComparisonItemModule {}
