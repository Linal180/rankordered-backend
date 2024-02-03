import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemScoreV1Service } from '../../item-score/v1/item-score-v1.service';
import { RatingSystemService } from '../../../utils/eloRating/RatingSystem.service';
import { VotingCreatedEvent } from '../events/VotingCreated.event';
import { Voting, VotingDocument } from '../schemas/Voting.schema';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { getVisitAnalytics } from 'src/utils/social-media-helpers/social-media.utils';
import { AnalysisReportDTO, VotingCountDTO, VotingStatsDTO } from '../dto/Stats.dto';

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

    async getVisitStats(): Promise<MongoResultQuery<AnalysisReportDTO>> {
        const res = new MongoResultQuery<AnalysisReportDTO>();
        console.log("********* getVisitStats *********")
        try {
            const { today, month } = await getVisitAnalytics();
            res.data = { today, month }
            res.status = OperationResult.fetch

            return res;
        } catch (error) {
            console.log(error)
        }
    }

    async getVotingCount(categoryId: string): Promise<MongoResultQuery<VotingCountDTO>> {
        const res = new MongoResultQuery<VotingCountDTO>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = await this.votingModel.countDocuments({
            categoryId,
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Votes created before tomorrow
            }
        }).exec();

        const all = await this.votingModel.find({ categoryId }).count();

        res.data = {
            all, today: todayCount
        }

        res.status = OperationResult.fetch
        return res
    }

    async getVotingStats(categoryId: string): Promise<MongoResultQuery<VotingStatsDTO[]>> {
        const res = new MongoResultQuery<VotingStatsDTO[]>();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dateArray = Array.from({ length: 31 }, (_, index) => {
            const date = new Date(thirtyDaysAgo);
            date.setDate(date.getDate() + index);
            const formattedDate = date.toISOString().split('T')[0];
            return formattedDate;
        });

        const result = await this.votingModel.aggregate([
            {
                $match: {
                    categoryId,
                    createdAt: {
                        $gte: thirtyDaysAgo,
                        $lt: new Date(new Date().setHours(23, 59, 59, 999)) // Votes created before end of today
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } // Convert date to string with format "YYYY-MM-DD"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        // Create a Map for quick lookup of results by date
        const resultMap = new Map(result.map(({ date, count }) => [date, count]));

        // Merge the aggregated results with the date array, filling in missing dates with count 0
        const finalResult = dateArray.map(date => ({
            date,
            count: resultMap.get(date) || 0
        }));

        res.data = finalResult
        res.status = OperationResult.complete

        return res
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(Voting.name);
    }
}
