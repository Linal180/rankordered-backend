import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ComparisonItemWithScore } from '../dto/ComparisonItemWithScore.dto';
import { CreateComparisonItemDto } from '../dto/CreateComparisonItem.dto';
import { UpdateComparisonItemDto } from '../dto/UpdateComparisonItem.dto';
import { ComparisonItem } from '../schemas/ComparisonItem.schema';
import { ComparisonItemV1Service } from './comparison-item-v1.service';

const mockComparisonItem: ComparisonItem = {
    name: 'test item',
    slug: 'test_item',
    category: [{ name: 'test category', slug: 'test_category', active: true }],
    defaultCategory: {
        name: 'test category',
        slug: 'test_category',
        active: true
    },
    active: true,
    address: 'address',
    foundedDate: '1995',
    website: 'website.com',
    source: {
        source: 'wiki'
    },
    label: ['college']
};

const mockComparisonItemWithScore: ComparisonItemWithScore = {
    name: 'test item',
    slug: 'test_item',
    category: [{ name: 'test category', slug: 'test_category' }],
    defaultCategory: { name: 'test category', slug: 'test_category' },
    address: 'address',
    foundedDate: '1995',
    website: 'website.com',
    source: {
        source: 'wiki'
    },
    label: ['college'],
    score: {
        itemId: '123456',
        categoryId: '123456',
        score: 1234
    }
};

const createComparisonItemDto: CreateComparisonItemDto = {
    name: 'test item',
    slug: 'test_item',
    category: ['123456'],
    defaultCategory: '123456'
};

const updateComparisonItemDto: UpdateComparisonItemDto = {
    name: 'test item 2'
};

describe('ComparisonItemV1Service', () => {
    let service: ComparisonItemV1Service;
    let model: Model<ComparisonItem>;
    let eventEmitter: EventEmitter2;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ComparisonItemV1Service,
                {
                    provide: getModelToken(ComparisonItem.name),
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest
                            .fn()
                            .mockResolvedValue(mockComparisonItem),
                        findByIdAndDelete: jest
                            .fn()
                            .mockResolvedValue(mockComparisonItem),
                        constructor: jest.fn(),
                        create: jest.fn().mockResolvedValue(mockComparisonItem),
                        aggregate: jest.fn(),
                        updateMany: jest.fn(),
                        exec: jest.fn(),
                        count: jest.fn()
                    }
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ComparisonItemV1Service>(ComparisonItemV1Service);
        model = module.get<Model<ComparisonItem>>(
            getModelToken(ComparisonItem.name)
        );
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        it('should return comparison item', async (done) => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockComparisonItem)
            } as any);

            const item = await service.findById('123456');

            expect(item.status).toBe(OperationResult.fetch);
            expect(spy).toBeCalledTimes(1);
            done();
        });

        it('should throw error when item not found', async (done) => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findById('123456');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('findByQuery', () => {
        it('should return comparison items', async (done) => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockComparisonItem]),
                count: jest.fn().mockResolvedValueOnce(1)
            } as any);

            const items = await service.findByQuery();

            expect(items.status).toBe(OperationResult.fetch);
            expect(items.count).toBe(1);
            expect(spy).toBeCalledTimes(2);

            done();
        });
    });

    describe('createItem', () => {
        it('should return created item', async (done) => {
            const spy = jest
                .spyOn(model, 'create')
                .mockResolvedValueOnce(mockComparisonItem as never);

            const item = await service.createItem(createComparisonItemDto);

            expect(spy).toBeCalledTimes(1);
            expect(item.status).toBe(OperationResult.create);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(1);
            done();
        });

        it('should throw error when created not found', async (done) => {
            const spy = jest
                .spyOn(model, 'create')
                .mockResolvedValueOnce(null as never);

            try {
                await service.createItem(createComparisonItemDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(0);
            done();
        });
    });

    describe('updateItem', () => {
        it('should return updated document', async (done) => {
            const item = await service.updateItem(
                '123456',
                updateComparisonItemDto
            );

            expect(jest.spyOn(model, 'findByIdAndUpdate')).toBeCalledTimes(1);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(1);
            expect(item.status).toBe(OperationResult.update);

            done();
        });

        it('should throw error when updated document not found', async (done) => {
            const spy = jest
                .spyOn(model, 'findByIdAndUpdate')
                .mockResolvedValueOnce(null);

            try {
                await service.updateItem('123456', updateComparisonItemDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(0);

            done();
        });
    });

    describe('deleteItem', () => {
        it('should return deleted document', async (done) => {
            const item = await service.deleteItem('123456');

            expect(jest.spyOn(model, 'findByIdAndDelete')).toBeCalledTimes(1);
            expect(item.status).toBe(OperationResult.delete);

            done();
        });

        it('should throw error when deleted item not found', async (done) => {
            const spy = jest
                .spyOn(model, 'findByIdAndDelete')
                .mockResolvedValueOnce(null);

            try {
                await service.deleteItem('123456');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('findByIdWithRanking', () => {
        it('should return tem document with ranking', async (done) => {
            const spy = jest.spyOn(model, 'aggregate').mockReturnValue({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce([mockComparisonItemWithScore])
            } as any);

            const item = await service.findByIdWithRanking(
                '61f54030f8899633c98ae4eb'
            );

            expect(spy).toBeCalledTimes(1);
            expect(item.status).toBe(OperationResult.fetch);
            done();
        });

        it('should throw error when no object found', async (done) => {
            const spy = jest.spyOn(model, 'aggregate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([])
            } as any);

            try {
                await service.findByIdWithRanking('61f54030f8899633c98ae4eb');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('findBySlugWithRanking', () => {
        it('should return tem document with ranking', async (done) => {
            const spy = jest.spyOn(model, 'aggregate').mockReturnValue({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce([mockComparisonItemWithScore])
            } as any);

            const item = await service.findBySlugWithRanking(
                'darmouth_college'
            );

            expect(spy).toBeCalledTimes(1);
            expect(item.status).toBe(OperationResult.fetch);
            done();
        });

        it('should throw error when no object found', async (done) => {
            const spy = jest.spyOn(model, 'aggregate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([])
            } as any);

            try {
                await service.findBySlugWithRanking('darmouth_college');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('findAllWithRanking', () => {
        it('should return all document by filter', async (done) => {
            const aggregateSpy = jest
                .spyOn(model, 'aggregate')
                .mockReturnValue({
                    exec: jest
                        .fn()
                        .mockResolvedValueOnce([mockComparisonItemWithScore])
                } as any);

            const findSpy = jest.spyOn(model, 'find').mockReturnValue({
                count: jest.fn().mockResolvedValueOnce(1)
            } as any);

            const items = await service.findAllWithRanking(
                '61f17467ea59d46cf3a21364',
                {
                    page: 2,
                    limit: 10,
                    currentPage: 1
                }
            );

            expect(aggregateSpy).toBeCalledTimes(1);
            expect(findSpy).toBeCalledTimes(1);
            expect(items.status).toBe(OperationResult.fetch);

            done();
        });

        it('should return all document by without category filter', async (done) => {
            const aggregateSpy = jest
                .spyOn(model, 'aggregate')
                .mockReturnValue({
                    exec: jest
                        .fn()
                        .mockResolvedValueOnce([mockComparisonItemWithScore])
                } as any);

            const findSpy = jest.spyOn(model, 'find').mockReturnValue({
                count: jest.fn().mockResolvedValueOnce(1)
            } as any);

            const items = await service.findAllWithRanking(undefined, {
                page: 2,
                limit: 10,
                currentPage: 1
            });

            expect(aggregateSpy).toBeCalledTimes(1);
            expect(findSpy).toBeCalledTimes(1);
            expect(items.status).toBe(OperationResult.fetch);

            done();
        });
    });

    describe('getComparisonItem', () => {
        it('should get comparison item', async (done) => {
            const spy = jest.spyOn(model, 'aggregate').mockReturnValue({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce([mockComparisonItemWithScore])
            } as any);

            const items = await service.getComparisonItem(
                '61f17467ea59d46cf3a21364'
            );

            expect(spy).toBeCalledTimes(1);
            expect(items.status).toBe(OperationResult.fetch);
            done();
        });
    });

    describe('toggleActiveAllItem', () => {
        it('should toggle all item active', async (done) => {
            const spy = jest.spyOn(model, 'updateMany').mockResolvedValue({
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0,
                upsertedCount: 0,
                upsertedId: null
            });

            const items = await service.toggleActiveAllItem(true);
            expect(spy).toBeCalledTimes(1);
            expect(items.status).toBe(OperationResult.update);
            done();
        });
    });

    describe('itemScoreLookup', () => {
        it('should return aggregate lookup', () => {
            const lookup = service.itemScoreLookup('61f17467ea59d46cf3a21364');
            expect(lookup.$lookup.let.categoryId).toBeTruthy();
        });

        it('should return aggregate lookup with default category id', () => {
            const lookup = service.itemScoreLookup();
            expect(lookup.$lookup.let.categoryId).toBe('$defaultCategory');
        });
    });

    describe('skip', () => {
        it('should return aggregate with skip', () => {
            const skip = service.skip(1);

            expect(skip.$skip).toBe(1);
        });

        it('should return aggregate with skip is null', () => {
            const skip = service.skip();

            expect(skip.$skip).toBe(0);
        });
    });

    describe('limit', () => {
        it('should return aggregate with limit', () => {
            const limit = service.limit(1);

            expect(limit.$limit).toBe(1);
        });

        it('should return aggregate with limit is null', () => {
            const limit = service.limit();

            expect(limit.$limit).toBe(10);
        });
    });
});
