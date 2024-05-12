import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { CreateSnapshotDto } from '../dto/CreateSnapshot.dto';
import { VotingLimit, VotingLimitDocument } from 'src/component/voting/schemas/VotingLimit.schema';
import {
    ScoreSnapshot,
    ScoreSnapshotDocument
} from '../schemas/score-snapshot.schema';

@Injectable()
export class ScoreSnapshotV1Service {
    private readonly logger = new Logger(ScoreSnapshotV1Service.name);

    constructor(
        @InjectModel(ScoreSnapshot.name)
        private scoreSnapshotModel: Model<ScoreSnapshotDocument>,
        @InjectModel(VotingLimit.name)
        private votingLimitModel: Model<VotingLimitDocument>
    ) { }

    async getSnapshot(
        itemId: string,
        categoryId: string
    ): Promise<MongoResultQuery<ScoreSnapshot[]>> {
        if (!itemId || !categoryId) {
            throw new HttpException(
                'itemId and categoryId should be empty',
                HttpStatus.BAD_REQUEST
            );
        }

        const res = new MongoResultQuery<ScoreSnapshot[]>();
        res.data = await this.scoreSnapshotModel
            .find({
                itemId: itemId,
                categoryId: categoryId
            })
            .sort({ date: 1 });

        res.count = res.data.length;
        res.status = OperationResult.fetch;

        return res;
    }

    async addSnapshot(data: CreateSnapshotDto) {
        this.logger.log(`saving data ${data.itemId} for ${data.date}`);
        return await this.scoreSnapshotModel.create({
            itemId: data.itemId,
            categoryId: data.categoryId,
            score: data.score,
            ranking: data.ranking,
            date: data.date
        });
    }

    // async houseKeepingSnapshot(): Promise<DeleteResult> {
    //     const dateLimit = DateTime.now()
    //         .startOf('day')
    //         .minus({ months: 2 })
    //         .toJSDate();

    //     this.logger.log(
    //         `Deleting snapshot older than ${dateLimit.toISOString()}`
    //     );

    //     return await this.scoreSnapshotModel.deleteMany({
    //         createdAt: { $lt: dateLimit }
    //     });
    // }

    async houseKeepingSnapshot(): Promise<DeleteResult> {
        const dateLimit = DateTime.now()
            .startOf('day')
            .minus({ months: 2 })
            .toJSDate();
    
        this.logger.log(`Deleting snapshots older than ${dateLimit.toISOString()}`);
    
        const result = await this.scoreSnapshotModel.aggregate([
            {
                $group: {
                    _id: "$itemId",
                    newestDate: { $max: "$date" },
                    oldestDate: { $min: "$date" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    $or: [
                        { oldestDate: { $lt: dateLimit }, newestDate: { $lt: dateLimit } }, // Only older than 2 months
                        { oldestDate: { $lt: dateLimit }, newestDate: { $gte: dateLimit } } // Mixed, include only older than 2 months
                    ]
                }
            }
        ]).exec();
    
        const itemIdsToDelete = result
        .filter((item: any) => item.newestDate >= dateLimit) // Filter out items with all records older than 2 months
        .map((item: any) => item._id);

        const deleteResult = await this.scoreSnapshotModel.deleteMany({
            itemId: { $in: itemIdsToDelete },
            date: { $lt: dateLimit } // Additional condition to ensure snapshots older than 2 months are deleted
        });

        return deleteResult;
    }

    async clearVotingLimitRecords(): Promise<DeleteResult> {
        return await this.votingLimitModel.deleteMany({});
    }
}

export interface DeleteResult {
    acknowledged: boolean;
    deletedCount: number;
}
