import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemScoreV1Service } from '../../item-score/v1/item-score-v1.service';
import { RatingSystemService } from '../../../utils/eloRating/RatingSystem.service';
import { VotingCreatedEvent } from '../events/VotingCreated.event';
import { Voting, VotingDocument } from '../schemas/Voting.schema';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';

@Injectable()
export class VotingV1Service {
    constructor(
        @InjectModel(Voting.name) private votingModel: Model<VotingDocument>,
        private scoreService: ItemScoreV1Service,
        private ratingSystem: RatingSystemService,
        private eventEmitter: EventEmitter2
    ) { }

    async findByItemId(itemId: string, categoryId: string): Promise<Voting[]> {
        return this.votingModel
            .find({
                categoryId: categoryId,
                $or: [{ contestantId: itemId }, { opponentId: itemId }]
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByCategoryId(categoryId: string): Promise<Voting[]> {
        return this.votingModel
            .find({ categoryId: categoryId })
            .sort({ createdAt: -1 })
            .exec();
    }

    private async findNumberOfComparison(
        contestantId: string,
        categoryId: string
    ): Promise<number> {
        return this.votingModel
            .find({
                categoryId: categoryId,
                $or: [
                    { contestantId: contestantId },
                    { opponentId: contestantId }
                ]
            })
            .count()
            .exec();
    }

    async deleteRecordsAfterDate(): Promise<void> {
        const dateToDeleteAfter = new Date('2024-02-04T00:00:00Z');

        try {
            // Use deleteMany to delete records after the specified date
            await this.votingModel.deleteMany({ createdAt: { $gt: dateToDeleteAfter } });
            console.log('Voting Records deleted successfully.');
        } catch (error) {
            console.error('Error deleting records:', error);
        }
    }

    /*
        This function is responsible for creating and storing vote.
        This function receives 
            - categoryID => related to default category of college
            - contestantID and opponentID => Colleges which took participation
            - winnerID => one of the colleges which was selected by user
    */
    async updateVoting(
        categoryId: string,
        contestantId: string,
        opponentId: string,
        winnerId: string
    ): Promise<Voting> {
        /*
            Following block of code is to get
                - Previous Score
                - Number of Comparisons
            for Contestant.
        */
        const contestantPreviousSCore =
            (
                await this.scoreService.findByItemIdAndCategoryId(
                    contestantId,
                    categoryId
                )
            )?.score ?? 0;

        const contestantNoOfComparison = await this.findNumberOfComparison(
            contestantId,
            categoryId
        );

        const opponentPreviousScore =
            (
                await this.scoreService.findByItemIdAndCategoryId(
                    opponentId,
                    categoryId
                )
            )?.score ?? 0;

        /*
            Calculating kFactor for Contestant.
        */
        const kFactor = this.ratingSystem.calculateKFactor(
            contestantNoOfComparison,
            contestantPreviousSCore
        );

        /*
            Calculating probability of Winning chance between 
            Contestant and opponent.
        */
        const probability = this.ratingSystem.calculateProbabilityOfWinning(
            contestantPreviousSCore,
            opponentPreviousScore
        );

        /*
            Calculating Next Rating for Contestant,
            Score will passed as 1 if contestant is winner, otherwise 0
        */
        let contestantCurrentSCore = this.ratingSystem.calculateNextRating(
            contestantPreviousSCore,
            probability,
            winnerId === contestantId ? 1 : 0,
            kFactor
        );

        // Allow Negative values on Pablo suggestion
        // if (contestantCurrentSCore < 0) {
        //     contestantCurrentSCore = 0;
        // }

        /*
            Calculating Next Rating for Opponent,
            Score will passed as 1 if contestant is opponent, otherwise 0
        */
        let opponentCurrentSCore = this.ratingSystem.calculateNextRating(
            opponentPreviousScore,
            1 - probability,
            winnerId === opponentId ? 1 : 0,
            kFactor
        );

        // Allow Negative values on Pablo suggestion
        // if (opponentCurrentSCore < 0) {
        //     opponentCurrentSCore = 0;
        // }

        const vote = await this.votingModel.create({
            categoryId: categoryId,
            contestantId: contestantId,
            contestantPreviousSCore: contestantPreviousSCore,
            contestantCurrentSCore: contestantCurrentSCore,
            opponentId: opponentId,
            opponentPreviousScore: opponentPreviousScore,
            opponentCurrentSCore: opponentCurrentSCore,
            winnerId: winnerId
        });

        if (!vote) {
            this.throwObjectNotFoundError();
        }

        // emit event here
        this.eventEmitter.emit(
            'Voting.Created',
            VotingCreatedEvent.create({
                contestantId: contestantId,
                contestantCurrentSCore: contestantCurrentSCore,
                opponentId: opponentId,
                opponentCurrentSCore: opponentCurrentSCore,
                categoryId: categoryId
            })
        );

        await this.deleteRecordsAfterDate()

        return vote;
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(Voting.name);
    }
}
