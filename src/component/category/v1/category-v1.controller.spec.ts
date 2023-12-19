import { Test, TestingModule } from '@nestjs/testing';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { CategoryV1Controller } from './category-v1.controller';
import { CategoryV1Service } from './category-v1.service';

const categoryMock = {
    _id: '123456',
    name: 'test category',
    active: true,
    slug: 'test_category'
};

const responseOne = {
    data: categoryMock,
    status: OperationResult.fetch
};

const responseMany = {
    data: [categoryMock],
    status: OperationResult.fetch,
    count: 1
};

describe('CategoryV1Controller', () => {
    let controller: CategoryV1Controller;
    let service: CategoryV1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryV1Controller],
            providers: [
                {
                    provide: CategoryV1Service,
                    useValue: {
                        findByQuery: jest.fn().mockResolvedValue(responseMany),
                        findById: jest.fn().mockResolvedValue(responseOne),
                        findBySlug: jest.fn().mockResolvedValue(responseOne),
                        createCategory: jest.fn(),
                        updateCategory: jest.fn(),
                        deleteCategory: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<CategoryV1Controller>(CategoryV1Controller);
        service = module.get<CategoryV1Service>(CategoryV1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getCategories', () => {
        it('should return categories', async () => {
            const categories = await controller.getCategories();

            expect(jest.spyOn(service, 'findByQuery')).toBeCalledTimes(1);
            expect(categories.status).toBe(OperationResult.fetch);
        });
    });

    describe('getCategory', () => {
        it('should return category', async () => {
            const category = await controller.getCategory('123456');

            expect(jest.spyOn(service, 'findById')).toBeCalledTimes(1);
            expect(category.status).toBe(OperationResult.fetch);
        });
    });

    describe('getCategoryBySlug', () => {
        it('should return category', async () => {
            const category = await controller.getCategoryBySlug('college');

            expect(jest.spyOn(service, 'findBySlug')).toBeCalledTimes(1);
            expect(category.status).toBe(OperationResult.fetch);
        });
    });

    describe('createCategory', () => {
        it('should return created category', async () => {
            responseOne.status = OperationResult.create;
            const spy = jest
                .spyOn(service, 'createCategory')
                .mockResolvedValue(responseOne);

            const category = await controller.createCategory({
                name: 'test',
                slug: 'test'
            });

            expect(category.status).toBe(OperationResult.create);
            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('updateCategory', () => {
        it('should return updated category', async () => {
            responseOne.status = OperationResult.update;

            const spy = jest
                .spyOn(service, 'updateCategory')
                .mockResolvedValue(responseOne);

            const category = await controller.updateCategory('123456', {
                name: 'test2'
            });

            expect(category.status).toBe(OperationResult.update);
            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('deleteCategory', () => {
        it('should return delete category', async () => {
            responseOne.status = OperationResult.delete;
            const spy = jest
                .spyOn(service, 'deleteCategory')
                .mockResolvedValue(responseOne);

            const category = await controller.deleteCategory('123456');

            expect(category.status).toBe(OperationResult.delete);
            expect(spy).toBeCalledTimes(1);
        });
    });
});
