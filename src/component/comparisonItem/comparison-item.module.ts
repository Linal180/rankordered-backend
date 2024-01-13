import { CacheModule, Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
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
import * as mongooseStore from 'cache-manager-mongoose';
import * as mongoose from 'mongoose';
import { CategoryModule } from '../category/category.module';
import {
  ScoreSnapshot,
  ScoreSnapshotSchema
} from '../scoresnapshot/schemas/score-snapshot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ComparisonItem.name, schema: ComparisonItemSchema },
      { name: ItemScore.name, schema: ItemScoreSchema },
      { name: ScoreSnapshot.name, schema: ScoreSnapshotSchema }
    ]),
    BullModule.registerQueue({ name: 'college_migration' }),
    CacheModule.registerAsync({
      useFactory: (connection: mongoose.Connection) => ({
        ttl: 3600,
        store: mongooseStore,
        mongoose: mongoose,
        connection: connection
      }),
      inject: [getConnectionToken()]
    }),
    GalleryModule,
    ItemScoreModule,
    CategoryModule
  ],
  providers: [ComparisonItemV1Service, CollegeQueueConsumer],
  controllers: [ComparisonItemV1Controller],
  exports: [ComparisonItemV1Service]
})

export class ComparisonItemModule { }
