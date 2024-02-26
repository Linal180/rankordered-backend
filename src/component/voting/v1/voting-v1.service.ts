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
import { VotingItemDto } from '../dto/VotingItem.dto';

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
        winnerId: string,
        userId?: string
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
            winnerId: winnerId,
            userId: userId || null
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

    async deleteRecordsAfterDate(date: string): Promise<MongoResultQuery<{ deleted: number }>> {
        const dateToDeleteAfter = new Date(date);
        dateToDeleteAfter.setHours(23, 59, 59, 999);
        const res = new MongoResultQuery<{ deleted: number }>();

        try {
            const result = await this.votingModel.deleteMany({ createdAt: { $gt: dateToDeleteAfter } });
            console.log('***** Votes deleted successfully created after', dateToDeleteAfter.toLocaleString(), 'Deleted count:', result.deletedCount, " *********");

            res.status = OperationResult.complete
            res.data = { deleted: result.deletedCount }
            return res
        } catch (error) {
            console.error('Error deleting records:', error);
            return null
        }
    }

    async discardUserTodayVotes(userId: string): Promise<MongoResultQuery<{ deleted: number }>> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const res = new MongoResultQuery<{ deleted: number }>();

        try {
            const result = await this.votingModel.deleteMany({
                userId: userId,
                createdAt: { $gt: startOfDay, $lt: endOfDay }
            });

            res.status = OperationResult.complete
            res.data = { deleted: result.deletedCount }
            return res
        } catch (error) {
            console.error('Error deleting records:', error);
            return null;
        }
    }

    isConsecutiveVotesFound(votes: VotingItemDto[]): boolean {
        let contestantCount = 0;
        let opponentCount = 0;

        for (let i = 0; i < votes.length; i++) {
            const isContestantWinner = votes[i].winnerId === votes[i].contestantId;
            const isOpponentWinner = votes[i].winnerId === votes[i].opponentId;

            if (isContestantWinner) {
                contestantCount++;
                opponentCount = 0;
                if (contestantCount === 5) {
                    return true;
                }
            } else if (isOpponentWinner) {
                opponentCount++;
                contestantCount = 0;
                if (opponentCount === 5) {
                    return true;
                }
            }
        }
        return false;
    }

    async isVotingAbused(userId: string): Promise<boolean> {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

            const userVotes = await this.votingModel
                .find({
                    userId: userId,
                    createdAt: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                })
                .sort({ createdAt: -1 })
                .exec();

            if (userVotes?.length > 4) {
                return this.isConsecutiveVotesFound(userVotes);
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error checking vote records:', error);
            return null;
        }
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(Voting.name);
    }
}
