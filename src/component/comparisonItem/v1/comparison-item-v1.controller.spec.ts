import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { CreateComparisonItemDto } from '../dto/CreateComparisonItem.dto';
import { UpdateComparisonItemDto } from '../dto/UpdateComparisonItem.dto';
import { ComparisonItemV1Controller } from './comparison-item-v1.controller';
import { ComparisonItemV1Service } from './comparison-item-v1.service';

const mockComparisonItemWithScore = {
    name: 'test item',
    slug: 'test_item',
    category: [{ name: 'test category', slug: 'test_category' }],
    defaultCategory: { name: 'test category', slug: 'test_category' },
    address: 'address',
    foundedDate: '1995',
    website: 'website.com',
    source: 'wiki',
    label: ['college'],
    score: {
        itemId: '123456',
        categoryId: '123456',
        score: 1234
    }
};

const mockComparisonItem = {
    name: 'test item',
    slug: 'test_item',
    category: [{ name: 'test category', slug: 'test_category', active: true }],
    defaultCategory: {
        name: 'test category',
        slug: 'test_category',
        active: true
    },
    address: 'address',
    foundedDate: '1995',
    website: 'website.com',
    source: {
        source: 'wiki'
    },
    active: true,
    label: ['college']
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

const responseOne = {
    data: mockComparisonItem,
    status: OperationResult.fetch
};

const responseMany = {
    data: [mockComparisonItem],
    count: 1,
    status: OperationResult.fetch
};

const responseOneWithScore = {
    data: mockComparisonItemWithScore,
    status: OperationResult.fetch
};

const responseManyWithScore = {
    data: [mockComparisonItemWithScore],
    count: 1,
    status: OperationResult.fetch
};

describe('ComparisonItemV1Controller', () => {
    let controller: ComparisonItemV1Controller;
    let service: ComparisonItemV1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ComparisonItemV1Controller],
            providers: [
                {
                    provide: ComparisonItemV1Service,
                    useValue: {
                        findAllWithRankingFromSnapshotOptimized: jest
                            .fn()
                            .mockResolvedValue(responseManyWithScore),
                        findAllWithRankingFromSnapshot: jest
                            .fn()
                            .mockResolvedValue(responseManyWithScore),
                        findByIdWithRanking: jest
                            .fn()
                            .mockResolvedValue(responseOneWithScore),
                        getComparisonItem: jest
                            .fn()
                            .mockResolvedValue(responseMany),
                        findBySlugWithRanking: jest
                            .fn()
                            .mockResolvedValue(responseOneWithScore),
                        createItem: jest.fn(),
                        updateItem: jest.fn(),
                        deleteItem: jest.fn()
                    }
                },
                { provide: CACHE_MANAGER, useFactory: jest.fn() }
            ]
        }).compile();

        controller = module.get<ComparisonItemV1Controller>(
            ComparisonItemV1Controller
        );

        service = module.get<ComparisonItemV1Service>(ComparisonItemV1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getComparisonItems', () => {
        it('should return comparison items', async () => {
            const items = await controller.getComparisonItems({
                page: 1,
                limit: 10,
                currentPage: 0
            });

            expect(items.status).toBe(OperationResult.fetch);
            expect(
                jest.spyOn(service, 'findAllWithRankingFromSnapshotOptimized')
            ).toBeCalledTimes(1);
        });
    });

    describe('getComparisonItem', () => {
        it('should return comparison item', async () => {
            const item = await controller.getComparisonItem('123456');

            expect(item.status).toBe(OperationResult.fetch);
            expect(jest.spyOn(service, 'findByIdWithRanking')).toBeCalledTimes(
                1
            );

        });
    });

    describe('getComparisonItemBySlug', () => {
        it('should return comparison item', async () => {
            const item = await controller.getComparisonItemBySlug(
                'darmouth_college'
            );

            expect(item.status).toBe(OperationResult.fetch);
            expect(
                jest.spyOn(service, 'findBySlugWithRanking')
            ).toBeCalledTimes(1);

        });
    });

    describe('getComparisonByCategory', () => {
        it('should return comparison item with category', async () => {
            const items = await controller.getComparisonByCategory('123456');

            expect(items.status).toBe(OperationResult.fetch);
            expect(jest.spyOn(service, 'getComparisonItem')).toBeCalledTimes(1);

        });
    });

    describe('createComparisonItem', () => {
        it('should return created document', async () => {
            responseOne.status = OperationResult.create;

            const spy = jest
                .spyOn(service, 'createItem')
                .mockResolvedValueOnce(responseOne as any);

            const item = await controller.createComparisonItem(
                createComparisonItemDto
            );

            expect(item.status).toBe(OperationResult.create);
            expect(spy).toBeCalledTimes(1);

        });
    });

    describe('updateComparisonItem', () => {
        it('should return created document', async () => {
            responseOne.status = OperationResult.update;

            const spy = jest
                .spyOn(service, 'updateItem')
                .mockResolvedValueOnce(responseOne as any);

            const item = await controller.updateComparisonItem(
                '123456',
                updateComparisonItemDto
            );

            expect(item.status).toBe(OperationResult.update);
            expect(spy).toBeCalledTimes(1);

        });
    });

    describe('deleteComparisonItem', () => {
        it('should return deleted document', async () => {
            responseOne.status = OperationResult.delete;

            const spy = jest
                .spyOn(service, 'deleteItem')
                .mockResolvedValueOnce(responseOne as any);

            const item = await controller.deleteComparisonItem('123456');

            expect(item.status).toBe(OperationResult.delete);
            expect(spy).toBeCalledTimes(1);

        });
    });
});
