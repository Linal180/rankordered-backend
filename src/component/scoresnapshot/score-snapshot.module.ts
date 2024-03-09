import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from '../category/category.module';
import { ComparisonItemModule } from '../comparisonItem/comparison-item.module';
import { ScoreSnapshotConsumer } from './consumer/score-snapshot.consumer';
import { ScoreSnapshotCronService } from './cronjob/score-snapshot-cron.service';
import {
    ScoreSnapshot,
    ScoreSnapshotSchema
} from './schemas/score-snapshot.schema';
import { ScoreSnapshotV1Controller } from './v1/score-snapshot-v1.controller';
import { ScoreSnapshotV1Service } from './v1/score-snapshot-v1.service';
import { VotingLimit, VotingLimitSchema } from '../voting/schemas/VotingLimit.schema';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'score_snapshot' }),
        MongooseModule.forFeature([
            { name: ScoreSnapshot.name, schema: ScoreSnapshotSchema },
            { name: VotingLimit.name, schema: VotingLimitSchema }
        ]),
        CategoryModule,
        ComparisonItemModule
    ],
    controllers: [ScoreSnapshotV1Controller],
    providers: [
        ScoreSnapshotCronService,
        ScoreSnapshotV1Service,
        ScoreSnapshotConsumer
    ]
})
export class ScoreSnapshotModule {}
