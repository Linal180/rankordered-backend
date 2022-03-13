import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ItemScore, ItemScoreDocument } from '../schemas/item-score.schema';

@Injectable()
export class ItemScoreV1Service {
    constructor(
        @InjectModel(ItemScore.name)
        private itemScoreModel: Model<ItemScoreDocument>
    ) {}

    async findAll(
        filter: any = {},
        options: any = { sort: { createdAt: -1 } }
    ): Promise<MongoResultQuery<ItemScore[]>> {
        const res = new MongoResultQuery<ItemScore[]>();

        res.data = await this.itemScoreModel.find(filter, null, options).exec();
        res.count = res.data.length;
        res.status = OperationResult.fetch;

        return res;
    }

    async findById(id: string): Promise<MongoResultQuery<ItemScore>> {
        const res = new MongoResultQuery<ItemScore>();

        res.data = await this.itemScoreModel.findById(id).exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async findByItemIdAndCategoryId(
        itemId: string,
        categoryId: string
    ): Promise<ItemScore> {
        return this.itemScoreModel
            .findOne(
                {
                    itemId: itemId,
                    categoryId: categoryId
                },
                null,
                { sort: { createdAt: -1 } }
            )
            .exec();
    }

    async updateScore(
        itemId: string,
        categoryId: string,
        score: number
    ): Promise<ItemScore> {
        return await this.itemScoreModel.create({
            itemId: itemId,
            categoryId: categoryId,
            score: score
        });
    }

    async findAndCreateScore(
        itemId: string,
        categoryId: string
    ): Promise<ItemScore> {
        let score = await this.itemScoreModel
            .findOne({
                itemId: itemId,
                categoryId: categoryId
            })
            .exec();

        if (!score) {
            score = await this.itemScoreModel.create({
                itemId: itemId,
                categoryId: categoryId,
                score: 0
            });
        }

        return score;
    }

    async deleteScoreByItemId(itemId: string) {
        await this.itemScoreModel.deleteMany({ itemId: itemId }).exec();
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(ItemScore.name);
    }
}
