import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { CreateSnapshotDto } from '../dto/CreateSnapshot.dto';
import {
    ScoreSnapshot,
    ScoreSnapshotDocument
} from '../schemas/score-snapshot.schema';

@Injectable()
export class ScoreSnapshotV1Service {
    private readonly logger = new Logger(ScoreSnapshotV1Service.name);

    constructor(
        @InjectModel(ScoreSnapshot.name)
        private scoreSnapshotModel: Model<ScoreSnapshotDocument>
    ) {}

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
}
