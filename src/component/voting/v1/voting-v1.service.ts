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
    ) {}

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

    async updateVoting(
        categoryId: string,
        contestantId: string,
        opponentId: string,
        winnerId: string
    ): Promise<Voting> {
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

        const kFactor = this.ratingSystem.calculateKFactor(
            contestantNoOfComparison,
            contestantPreviousSCore
        );

        const probability = this.ratingSystem.calculateProbabilityOfWinning(
            contestantPreviousSCore,
            opponentPreviousScore
        );

        let contestantCurrentSCore = this.ratingSystem.calculateNextRating(
            contestantPreviousSCore,
            probability,
            winnerId === contestantId ? 1 : 0,
            kFactor
        );

        if (contestantCurrentSCore < 0) {
            contestantCurrentSCore = 0;
        }

        let opponentCurrentSCore = this.ratingSystem.calculateNextRating(
            opponentPreviousScore,
            1 - probability,
            winnerId === opponentId ? 1 : 0,
            kFactor
        );

        if (opponentCurrentSCore < 0) {
            opponentCurrentSCore = 0;
        }

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

        return vote;
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(Voting.name);
    }
}
