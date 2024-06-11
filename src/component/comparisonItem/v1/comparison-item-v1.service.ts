import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
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
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';
import { FlagRequestV1Service } from '../../flag-request/v1/flag-request-v1.service';
import { ItemScoreV1Service } from '../../item-score/v1/item-score-v1.service';
import {
    ScoreSnapshot,
    ScoreSnapshotDocument
} from 'src/component/scoresnapshot/schemas/score-snapshot.schema';

@Injectable()
export class ComparisonItemV1Service {
    constructor(
        @InjectModel(ComparisonItem.name)
        private itemModel: Model<ComparisonItemDocument>,
        @InjectModel(ScoreSnapshot.name)
        private scoreSnapshotModel: Model<ScoreSnapshotDocument>,
        private eventEmitter: EventEmitter2,
        private readonly categoryService: CategoryV1Service,
        private readonly itemScoreV1Service: ItemScoreV1Service,
        @Inject(forwardRef(() => FlagRequestV1Service))
        private readonly flagRequestService: FlagRequestV1Service
    ) { }

    async findById(id: string): Promise<MongoResultQuery<ComparisonItem>> {
        const res = new MongoResultQuery<ComparisonItem>();

        res.data = await this.itemModel.findById(id).exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;
        return res;
    }

    async findByProfile(id: string): Promise<ComparisonItemWithScore> {
        const item = await this.itemModel.findOne({ profile: id }).exec();
        if (item) {
            const { data } = await this.findByIdWithRanking(
                item._id,
                ((item.defaultCategory as any)._id || '').toString()
            )

            return data;
        }

        return null
    }

    async findByQuery({
        filter,
        page = 0,
        limit = 10
    }: {
        filter: any;
        page: number;
        limit: number;
    }): Promise<MongoResultQuery<ComparisonItem[]>> {
        const res = new MongoResultQuery<ComparisonItem[]>();
        res.data = await this.itemModel
            .find(filter)
            .skip(page * limit)
            .limit(limit)
            .exec();
        res.count = await this.itemModel.find(filter).count();
        res.status = OperationResult.fetch;
        return res;
    }

    async createItem(
        createItemData: CreateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDocument>> {
        const res = new MongoResultQuery<ComparisonItemDocument>();

        try {
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
        } catch (error) {
            console.log(`Error in Comparison Item Service ${this.createItem.name}`)
        }
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

    async deleteItemByProfile(id: string): Promise<ComparisonItem> {

        const item = await this.itemModel.findOne({ profileId: id });

        if (item) {
            // await this.itemModel.deleteOne(item._id)

            this.eventEmitter.emit(
                'ComparisonItem.deleted',
                ComparisonItemDeletedEvent.create({ id: item._id })
            );

            return item;
        }

        return null;
    }

    async findByIdWithRanking(
        id: string,
        categoryId: string = null
    ): Promise<MongoResultQuery<ComparisonItemWithScore>> {
        const res = new MongoResultQuery<ComparisonItemWithScore>();

        res.data = (
            await this.itemModel
                .aggregate([
                    this.itemScoreLookup(categoryId),
                    this.itemScoreRefine,
                    {
                        $setWindowFields: {
                            sortBy: { 'score.score': -1 },
                            output: { ranking: { $documentNumber: {} } }
                        }
                    },
                    {
                        $match: {
                            _id: new Types.ObjectId(id)
                        }
                    },
                    this.scoreCategoryLookup,
                    this.scoreCategoryRefine,
                    this.categoryLookup,
                    this.defaultCategoryLookup,
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
                    this.filterActive,
                    {
                        $match: {
                            slug: slug
                        }
                    },
                    this.itemScoreBySnapshotLookup(categoryId),
                    this.itemScoreRefine,
                    this.addRanking,
                    this.imagesLookup,
                    this.defaultImageLookup,
                    this.defaultImageRefine,
                    this.scoreSnapshotLookup(categoryId),
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

    async findAllWithRanking({
        categoryId = null,
        pagination,
        search,
        active
    }: {
        categoryId: string;
        pagination: PaginationDto;
        search?: string;
        active?: boolean | string;
    }): Promise<MongoResultQuery<ComparisonItemWithScore[]>> {
        // eslint-disable-next-line prefer-const
        let aggregateOperation = [];
        const options: any = {};

        if (categoryId) {
            aggregateOperation.push({
                $match: { category: new Types.ObjectId(categoryId) }
            });

            options.category = categoryId;
        }

        if (active !== undefined) {
            aggregateOperation.push({
                $match: {
                    active:
                        typeof active === 'string' ? active == 'true' : active
                }
            });

            options.active = active;
        }

        aggregateOperation.push(
            this.itemScoreLookup(categoryId),
            this.itemScoreRefine,
            this.scoreCategoryLookup,
            this.scoreCategoryRefine,
            this.scoreSort
        );

        if (search && search.length) {
            aggregateOperation.push({
                $match: {
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            });

            options.name = new RegExp(search, 'i');
        }

        aggregateOperation.push(
            this.skip(pagination.currentPage * pagination.limit),
            this.limit(pagination.limit),
            this.categoryLookup,
            this.defaultCategoryLookup,
            this.defaultCategoryRefine,
            this.imagesLookup,
            this.defaultImageLookup,
            this.defaultImageRefine,
            this.scoreSnapshotLookup(categoryId)
        );

        const res = new MongoResultQuery<ComparisonItemWithScore[]>();

        try {
            res.data = await this.itemModel
                .aggregate(aggregateOperation)
                .exec();
            res.count = await this.itemModel.find(options).count();
        } catch (error) {
            console.log('error', error);
        }
        res.status = OperationResult.fetch;

        return res;
    }

    async findAllWithRankingFromSnapshot({
        categoryId = null,
        pagination
    }: {
        categoryId: string;
        pagination: PaginationDto;
        search?: string;
        active?: boolean | string;
    }): Promise<MongoResultQuery<ComparisonItemWithScore[]>> {
        // eslint-disable-next-line prefer-const
        let aggregateOperation = [];
        const options: any = {};

        if (categoryId) {
            aggregateOperation.push({
                $match: { category: new Types.ObjectId(categoryId) }
            });

            options.category = categoryId;
        }

        aggregateOperation.push(
            this.itemScoreBySnapshotLookup(categoryId),
            this.itemScoreRefine,
            this.addRanking,
            this.rankingSort,
            this.skip(pagination.currentPage * pagination.limit),
            this.limit(pagination.limit),
            this.categoryLookup,
            this.defaultCategoryLookup,
            this.defaultCategoryRefine,
            this.imagesLookup,
            this.defaultImageLookup,
            this.defaultImageRefine,
            this.scoreSnapshotLookup(categoryId)
        );

        const res = new MongoResultQuery<ComparisonItemWithScore[]>();

        res.data = await this.itemModel.aggregate(aggregateOperation).exec();
        res.count = await this.itemModel.find(options).count();
        res.status = OperationResult.fetch;

        return res;
    }

    async findAllWithRankingFromSnapshotOptimized({
        categoryId = null,
        pagination,
        search,
        active,
        ids,
        favorite = false,
        userId
    }: {
        categoryId: string;
        pagination: PaginationDto;
        search?: string;
        active?: boolean | string;
        ids?: string[];
        favorite?: boolean;
        userId?: string;
    }): Promise<MongoResultQuery<ComparisonItem[]>> {
        // eslint-disable-next-line prefer-const
        const options: any = {};

        if (categoryId) {
            options.category = categoryId;
        }

        if (active !== undefined) {
            options.active = active;
        }

        const res = new MongoResultQuery<ComparisonItemWithScore[]>();

        const category = await this.categoryService.findById(categoryId, true);

        const skip = pagination.currentPage * pagination.limit;

        let itemsQuery = {
            ...options,
            category: { $elemMatch: { $eq: categoryId } }
        };

        if (favorite) {
            itemsQuery = {
                ...itemsQuery,
                _id: { $in: ids }
            };
        }

        const data = await this.itemModel.find(itemsQuery)
            .populate('profile')
            .exec();

        const items = data.filter(item => {
            if (!item.profile) {
                return true;
            }

            return !['approved', 'submitted'].includes(item.profile?.flag);
        });

        const categoryItemsIds = category.data.categoryRankingItems.filter(
            (item) => {
                const foundItem = items.find(
                    (v) => v._id.toString() === item.itemId.toString()
                );

                return (
                    foundItem &&
                    foundItem.active &&
                    item.scoreSnapshot.length > 0
                );
            }
        );

        let currentUserFlagRequests = []

        if (userId) {
            currentUserFlagRequests = await this.flagRequestService.findCurrentUserRequests(userId)
            console.log(currentUserFlagRequests)
        }

        const sortedItems = items
            .map((item) => ({
                ...(item as any)._doc,
                ranking:
                    categoryItemsIds
                        .map((item) => item.itemId)
                        .indexOf(item.id) + 1
            }))
            .sort((first, last) => first.ranking - last.ranking)
            .filter((item) => new RegExp(search, 'i').test(item.name))
            .slice(skip, skip + pagination.limit) as ComparisonItemDocument[];

        const targetSnapshotsIds = sortedItems.reduce((acc, curr) => {
            const itemScoreSnapshotIds =
                category.data.categoryRankingItems.find(
                    (item) => item.itemId.toString() === curr._id.toString()
                )?.scoreSnapshot;

            if (Array.isArray(itemScoreSnapshotIds)) {
                return [...acc, ...itemScoreSnapshotIds];
            } else {
                return acc;
            }
        }, []);

        const scoreSnapshots = await this.scoreSnapshotModel
            .find({
                _id: {
                    $in: targetSnapshotsIds
                },
                categoryId: categoryId
            })
            .sort({ date: 1 });

        res.data = sortedItems.map((item) => ({
            ...item,
            scoreSnapshot: scoreSnapshots.filter(
                (score) => score.itemId.toString() === item._id.toString()
            )
        })) as any;

        if (favorite) {
            res.count = ids.length
        } else {
            res.count = await this.itemModel.find(options).count();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async getComparisonItemTotalCount() {
        return this.itemModel.find().count();
    }

    async getComparisonItemTotalScoreSnaps(itemId: string) {
        return this.scoreSnapshotModel.find({ itemId }).count();
    }

    async getComparisonItem(
        categoryId: string
    ): Promise<MongoResultQuery<ComparisonItem[]>> {
        const res = new MongoResultQuery<ComparisonItem[]>();

        res.data = await this.itemModel
            .aggregate([
                {
                    $match: {
                        category: new Types.ObjectId(categoryId),
                        active: true
                    }
                },
                { $sample: { size: 2 } },
                this.imagesLookup,
                this.defaultImageLookup,
                this.defaultImageRefine
            ])
            .exec();

        res.status = OperationResult.fetch;
        return res;
    }

    async toggleActiveComparisonItem(
        id: string,
        active: boolean
    ): Promise<MongoResultQuery<ComparisonItem>> {
        const res = new MongoResultQuery<ComparisonItem>();

        res.data = await this.itemModel.findByIdAndUpdate(
            id,
            { active: active },
            { returnDocument: 'after' }
        );

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.update;
        return res;
    }

    async toggleActiveAllItem(
        active: boolean
    ): Promise<{ status: OperationResult }> {
        console.log('running');
        const res = await this.itemModel.updateMany({}, { active: active });

        if (!res.acknowledged) {
            throw new HttpException(
                'Update activation failed',
                HttpStatus.BAD_REQUEST
            );
        }

        return { status: OperationResult.update };
    }

    async checkItemsActivationStatus(): Promise<MongoResultQuery<boolean>> {
        const res = new MongoResultQuery<boolean>();

        res.data = (await this.itemModel.find({ active: true }).count()) > 0;
        res.status = OperationResult.fetch;

        return res;
    }

    async deleteRecordsAfterDate(date: string): Promise<MongoResultQuery<{ deleted: number }>> {
        const dateToDeleteAfter = new Date(date);
        dateToDeleteAfter.setHours(23, 59, 59, 999);
        const res = new MongoResultQuery<{ deleted: number }>();

        try {
            const result = await this.scoreSnapshotModel.deleteMany({ createdAt: { $gt: dateToDeleteAfter } });
            console.log('***** ScoreSnaps deleted successfully created after', dateToDeleteAfter.toLocaleString(), 'Deleted count:', result.deletedCount, " *********");
            res.status = OperationResult.complete
            res.data = { deleted: result.deletedCount }
            return res
        } catch (error) {
            console.error('Error deleting records:', error);
            return null
        }
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

    itemScoreBySnapshotLookup = (categoryId = null) => ({
        $lookup: {
            from: 'scoresnapshots',
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
    });

    addRanking = {
        $addFields: {
            ranking: '$score.ranking'
        }
    };

    rankingSort = {
        $sort: {
            ranking: 1
        }
    };

    filterActive = {
        $match: {
            active: true
        }
    };

    itemScoreRefine = {
        $unwind: {
            path: '$score',
            preserveNullAndEmptyArrays: true
        }
    };

    scoreSnapshotLookup = (categoryId = null) => {
        return {
            $lookup: {
                from: 'scoresnapshots',
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
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: '%Y-%m-%d',
                                    date: '$createdAt'
                                }
                            },
                            score: { $last: '$$ROOT' }
                        }
                    },
                    {
                        $sort: {
                            'score.createdAt': -1
                        } as const
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$score'
                        }
                    },
                    {
                        $limit: 10
                    },
                    {
                        $sort: {
                            createdAt: 1
                        } as const
                    }
                ],
                as: 'scoreSnapshot'
            }
        };
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

    defaultCategoryLookup = {
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
        $setWindowFields: {
            sortBy: { 'score.score': -1 },
            output: { ranking: { $documentNumber: {} } }
        }
    };

    scoreSnapshotsLookup = {
        $lookup: {
            from: 'scoresnapshots',
            localField: 'scoreSnapshotIds',
            foreignField: '_id',
            as: 'scoreSnapshot'
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

    async updateScores(): Promise<MongoResultQuery<void>> {
        const res = new MongoResultQuery<void>();
        return res;

        // let count = 0;
        // const pageSize = 10;
        // let currentPage = 1;

        // const allPromises: Promise<any>[] = [];

        // while (true) {
        //     const skipCount = (currentPage - 1) * pageSize;

        //     const colleges = await this.itemModel
        //         .find({}, '_id name -category -defaultCategory -defaultImage -images')
        //         .skip(skipCount)
        //         .limit(pageSize)
        //         .exec();

        //     console.log(`Page ${currentPage}, Total Colleges: ${colleges.length}`);

        //     if (colleges.length === 0) {
        //         break;
        //     }

        //     const promises = colleges.map(async ({ _id, name }) => {
        //         try {
        //             const scoreItem = await this.itemScoreV1Service.findByItemId(_id)

        //             if (!scoreItem) {
        //                 console.error(`-----------No record found for ${name}------------`);
        //                 return null;
        //             }


        //             console.log(`**** Updating score for ${name} from ${scoreItem.score} to ${(scoreItem.score + 1500.00).toFixed(2)} ******`);
        //             count++;

        //             const updateResult = await this.itemScoreV1Service.updateExistingScore(_id, scoreItem.score + 1500)

        //             if (updateResult) {
        //                 return updateResult;
        //             } else {
        //                 console.error(`Update did not modify any records for ${name}`);
        //                 return null;
        //             }
        //         } catch (error) {
        //             console.error(`Error updating score for ${name}: ${error.message} `);
        //             return null;
        //         }
        //     });

        //     allPromises.push(...promises);
        //     currentPage++;
        // }

        // await Promise.all(allPromises);

        // console.log(`************ Score updated for colleges ************** `);

        // res.status = OperationResult.update;
        // return res;
    }

    private throwObjectNotFoundError(): void {
        throw new ObjectNotFoundException(ComparisonItem.name);
    }
}
