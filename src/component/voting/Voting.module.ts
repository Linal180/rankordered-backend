import { Module } from '@nestjs/common';
import { VotingV1Service } from './v1/voting-v1.service';
import { VotingV1Controller } from './v1/voting-v1.controller';
import { ItemScoreModule } from '../item-score/item-score.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Voting, VotingSchema } from './schemas/Voting.schema';
import { EloRatingModule } from '../../utils/eloRating/EloRating.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Voting.name, schema: VotingSchema }
        ]),
        ItemScoreModule,
        EloRatingModule,
        UserModule
    ],
    providers: [VotingV1Service],
    controllers: [VotingV1Controller]
})
export class VotingModule { }
