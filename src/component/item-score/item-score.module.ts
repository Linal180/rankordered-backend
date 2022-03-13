import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemScore, ItemScoreSchema } from './schemas/item-score.schema';
import { ItemScoreV1Service } from './v1/item-score-v1.service';
import { ItemScoreV1Controller } from './v1/item-score-v1.controller';
import { ItemScoreListener } from './listeners/ItemScore.listener';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ItemScore.name, schema: ItemScoreSchema }
        ])
    ],
    providers: [ItemScoreV1Service, ItemScoreListener],
    controllers: [ItemScoreV1Controller],
    exports: [ItemScoreV1Service]
})
export class ItemScoreModule {}
