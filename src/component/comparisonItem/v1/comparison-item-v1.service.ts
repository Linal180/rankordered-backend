import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { PaginationDto } from '../../../shared/pagination/Pagination.dto';
import { CreateComparisonItemDto } from '../dto/CreateComparisonItem.dto';
import { UpdateComparisonItemDto } from '../dto/UpdateComparisonItem.dto';
import { ComparisonItemCreatedEvent } from '../events/ComparisonItemCreated.event';
import { ComparisonItemDeletedEvent } from '../events/ComparisonItemDeleted.event';
import { ComparisonItemUpdatedEvent } from '../events/ComparisonItemUpdated.event';
import {
    ComparisonItem,
    ComparisonItemDocument
} from '../schemas/ComparisonItem.schema';
import { ComparisonItemWithScore } from '../schemas/ComparisonItemWithScore';

@Injectable()
export class ComparisonItemV1Service {
    constructor(
        @InjectModel(ComparisonItem.name)
        private itemModel: Model<ComparisonItemDocument>,

        private eventEmitter: EventEmitter2
    ) {}

    async findById(id: string): Promise<MongoResultQuery<ComparisonItem>> {
        const res = new MongoResultQuery<ComparisonItem>();

        res.data = await this.itemModel.findById(id).exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;
        return res;
    }

    async findByQuery(
        filter: any = {}
    ): Promise<MongoResultQuery<ComparisonItem[]>> {
        const res = new MongoResultQuery<ComparisonItem[]>();
        res.data = await this.itemModel.find(filter).exec();
        res.count = await this.itemModel.find().count();
        res.status = OperationResult.fetch;
        return res;
    }

    async createItem(
        createItemData: CreateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDocument>> {
        const res = new MongoResultQuery<ComparisonItemDocument>();

        const item = await this.itemModel.create(createItemData);

        if (!item) {
            this.throwObjectNotFoundError();
        }

        this.eventEmitter.emit(
            'ComparisonItem.created',
            ComparisonItemCreatedEvent.create({
                id: item.id,
                category: createItemData.category
            })
        );

        res.data = item;
        res.status = OperationResult.create;

        return res;
    }

    async updateItem(
        id: string,
        updateItemData: UpdateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItem>> {
        const res = new MongoResultQuery<ComparisonItem>();

        const item = await this.itemModel.findByIdAndUpdate(
            id,
            updateItemData,
            {
                returnDocument: 'after'
            }
        );

        if (!item) {
            this.throwObjectNotFoundError();
        }

        this.eventEmitter.emit(
            'ComparisonItem.updated',
            ComparisonItemUpdatedEvent.create({
                id: item.id,
                category: updateItemData.category
            })
        );

        res.data = item;
        res.status = OperationResult.update;

        return res;
    }

    async deleteItem(id: string): Promise<MongoResultQuery<ComparisonItem>> {
        const res = new MongoResultQuery<ComparisonItem>();

        const item = await this.itemModel.findByIdAndDelete(id);

        if (!item) {
            this.throwObjectNotFoundError();
        }

        this.eventEmitter.emit(
            'ComparisonItem.deleted',
            ComparisonItemDeletedEvent.create({ id: item.id })
        );

        res.data = item;
        res.status = OperationResult.delete;

        return res;
    }

    async findByIdWithRanking(
        id: string,
        categoryId: string = null
    ): Promise<MongoResultQuery<ComparisonItemWithScore>> {
        const res = new MongoResultQuery<ComparisonItemWithScore>();

        res.data = (
            await this.itemModel
                .aggregate([
                    {
                        $match: {
                            _id: new Types.ObjectId(id)
                        }
                    },
                    this.itemScoreLookup(categoryId),
                    this.itemScoreRefine,
                    this.scoreCategoryLookup,
                    this.scoreCategoryRefine,
                    this.categoryLookup,
                    this.defaultCategotyLookup,
                    this.defaultCategoryRefine,
                    this.imagesLookup,
                    this.defaultImageLookup,
                    this.defaultImageRefine,
                    { $limit: 1 }
                ])
                .exec()
        )[0];

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async findBySlugWithRanking(
        slug: string,
        categoryId: string = null
    ): Promise<MongoResultQuery<ComparisonItemWithScore>> {
        const res = new MongoResultQuery<ComparisonItemWithScore>();

        res.data = (
            await this.itemModel
                .aggregate([
                    {
                        $match: {
                            slug: slug
                        }
                    },
                    this.itemScoreLookup(categoryId),
                    this.itemScoreRefine,
                    this.scoreCategoryLookup,
                    this.scoreCategoryRefine,
                    { $limit: 1 }
                ])
                .exec()
        )[0];

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async findAllWithRanking(
        categoryId: string = null,
        pagination: PaginationDto
    ): Promise<MongoResultQuery<ComparisonItemWithScore[]>> {
        // eslint-disable-next-line prefer-const
        let aggregateOperation = [];
        let options = {};

        if (categoryId) {
            aggregateOperation.push({
                $match: { category: new Types.ObjectId(categoryId) }
            });

            options = { category: categoryId };
        }

        aggregateOperation.push(
            this.itemScoreLookup(categoryId),
            this.itemScoreRefine,
            this.scoreCategoryLookup,
            this.scoreCategoryRefine,
            this.scoreSort,
            this.skip(pagination.currentPage * pagination.limit),
            this.limit(pagination.limit),
            this.categoryLookup,
            this.defaultCategotyLookup,
            this.defaultCategoryRefine,
            this.imagesLookup,
            this.defaultImageLookup,
            this.defaultImageRefine
        );

        const res = new MongoResultQuery<ComparisonItemWithScore[]>();

        res.data = await this.itemModel.aggregate(aggregateOperation).exec();
        res.count = await this.itemModel.find(options).count();
        res.status = OperationResult.fetch;

        return res;
    }

    async getComparisonItem(
        categoryId: string
    ): Promise<MongoResultQuery<ComparisonItem[]>> {
        const res = new MongoResultQuery<ComparisonItem[]>();

        res.data = await this.itemModel
            .aggregate([
                { $match: { category: new Types.ObjectId(categoryId) } },
                { $sample: { size: 2 } }
            ])
            .exec();

        res.status = OperationResult.fetch;
        return res;
    }

    itemScoreLookup = (categoryId = null) => {
        return {
            $lookup: {
                from: 'itemscores',
                let: {
                    itemId: '$_id',
                    categoryId: categoryId
                        ? new Types.ObjectId(categoryId)
                        : '$defaultCategory'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$itemId', '$$itemId']
                                    },
                                    {
                                        $eq: ['$categoryId', '$$categoryId']
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        } as const
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'score'
            }
        };
    };

    itemScoreRefine = {
        $unwind: {
            path: '$score',
            preserveNullAndEmptyArrays: true
        }
    };

    scoreCategoryLookup = {
        $lookup: {
            from: 'categories',
            localField: 'score.categoryId',
            foreignField: '_id',
            as: 'score.category'
        }
    };

    scoreCategoryRefine = {
        $unwind: {
            path: '$score.category',
            preserveNullAndEmptyArrays: true
        }
    };

    categoryLookup = {
        $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
        }
    };

    defaultCategotyLookup = {
        $lookup: {
            from: 'categories',
            localField: 'defaultCategory',
            foreignField: '_id',
            as: 'defaultCategory'
        }
    };

    defaultCategoryRefine = {
        $unwind: {
            path: '$defaultCategory',
            preserveNullAndEmptyArrays: true
        }
    };

    imagesLookup = {
        $lookup: {
            from: 'galleries',
            localField: 'images',
            foreignField: '_id',
            as: 'images'
        }
    };

    defaultImageLookup = {
        $lookup: {
            from: 'galleries',
            localField: 'defaultImage',
            foreignField: '_id',
            as: 'defaultImage'
        }
    };

    defaultImageRefine = {
        $unwind: {
            path: '$defaultImage',
            preserveNullAndEmptyArrays: true
        }
    };

    scoreSort = {
        $sort: {
            'score.score': -1
        }
    };

    skip = (skip = 0) => {
        return {
            $skip: skip
        };
    };

    limit = (limit = 10) => {
        return {
            $limit: limit
        };
    };

    private throwObjectNotFoundError(): void {
        throw new ObjectNotFoundException(ComparisonItem.name);
    }
}
