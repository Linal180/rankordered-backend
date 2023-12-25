import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { CreateCategoryDto } from '../dto/CreateCategory.dto';
import { UpdateCategoryDto } from '../dto/UpdateCategory.dto';
import { Category } from '../schemas/category.schema';
import { CategoryV1Service } from './category-v1.service';

const mockCategory = {
    _id: '123456',
    name: 'test category',
    slug: 'test_category'
};

const createCategoryDto: CreateCategoryDto = {
    name: 'test category',
    slug: 'test_category'
};

const updateCategoryDto: UpdateCategoryDto = {
    name: 'updated category'
};

describe('CategoryV1Service', () => {
    let service: CategoryV1Service;
    let model: Model<Category>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryV1Service,
                {
                    provide: getModelToken(Category.name),
                    useValue: {
                        findById: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn().mockResolvedValue(mockCategory),
                        findByIdAndUpdate: jest.fn(),
                        findByIdAndDelete: jest
                            .fn()
                            .mockResolvedValue(mockCategory),
                        exec: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<CategoryV1Service>(CategoryV1Service);
        model = module.get<Model<Category>>(getModelToken(Category.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        it('should return user when find by id', async () => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockCategory)
            } as any);

            const category = await service.findById(mockCategory._id);

            expect(spy).toBeCalledTimes(1);
            expect(category.data.name).toBe(mockCategory.name);
            expect(category.status).toBe(OperationResult.fetch);
        });

        it('should throw error when user not found', async () => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findById(mockCategory._id);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('findBySlug', () => {
        it('should return user when find by id', async () => {
            const spy = jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockCategory)
            } as any);

            const category = await service.findBySlug(mockCategory.slug);

            expect(spy).toBeCalledTimes(1);
            expect(category.data.name).toBe(mockCategory.name);
            expect(category.status).toBe(OperationResult.fetch);
        });

        it('should throw error when user not found', async () => {
            const spy = jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findBySlug(mockCategory.slug);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('findByQuery', () => {
        it('should return categories when category found', async () => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockCategory])
            } as any);

            const category = await service.findByQuery();

            expect(spy).toBeCalledTimes(1);
            expect(category.count).toBe(1);
            expect(category.status).toBe(OperationResult.fetch);
        });

        it('should return empty array when categories not found', async () => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([])
            } as any);

            const category = await service.findByQuery();

            expect(spy).toBeCalledTimes(1);
            expect(category.data.length).toBe(0);
            expect(category.status).toBe(OperationResult.fetch);
        });
    });

    describe('createCategory', () => {
        it('should return created category', async () => {
            const category = await service.createCategory(createCategoryDto);

            expect(jest.spyOn(model, 'create')).toBeCalledTimes(1);
            expect(category.data.name).toBe(createCategoryDto.name);
            expect(category.status).toBe(OperationResult.create);
        });

        it('should throw error created category undefined', async () => {
            const spy = jest
                .spyOn(model, 'create')
                .mockResolvedValueOnce(null as never);

            try {
                await service.createCategory(createCategoryDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('updateCategory', () => {
        it('should return updated category', async () => {
            mockCategory.name = updateCategoryDto.name;
            const spy = jest
                .spyOn(model, 'findByIdAndUpdate')
                .mockResolvedValueOnce(mockCategory);

            const category = await service.updateCategory(
                '123456',
                updateCategoryDto
            );

            expect(spy).toBeCalledTimes(1);
            expect(category.data.name).toBe(updateCategoryDto.name);
            expect(category.status).toBe(OperationResult.update);
        });

        it('should throw error when not found updated category', async () => {
            const spy = jest
                .spyOn(model, 'findByIdAndUpdate')
                .mockResolvedValueOnce(null);

            try {
                await service.updateCategory('123456', updateCategoryDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('deleteCategory', () => {
        it('should return deleted category', async () => {
            const category = await service.deleteCategory('123456');

            expect(jest.spyOn(model, 'findByIdAndDelete')).toBeCalledTimes(1);
            expect(category.status).toBe(OperationResult.delete);
        });

        it('should throw error when not found deleted category', async () => {
            const spy = jest
                .spyOn(model, 'findByIdAndDelete')
                .mockResolvedValueOnce(null);

            try {
                await service.deleteCategory('123456');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });
});
