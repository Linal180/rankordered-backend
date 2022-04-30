import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ComparisonItemModule } from './comparisonItem/comparison-item.module';
import { ContactModule } from './contact/contact.module';
import { UserModule } from './user/user.module';
import { ItemScoreModule } from './item-score/item-score.module';
import { VotingModule } from './voting/Voting.module';
import { ScoreSnapshotModule } from './scoresnapshot/score-snapshot.module';

@Module({
    imports: [
        UserModule,
        AuthModule,
        CategoryModule,
        ComparisonItemModule,
        ContactModule,
        ItemScoreModule,
        VotingModule,
        ScoreSnapshotModule
    ]
})
export class ComponentModule {}
