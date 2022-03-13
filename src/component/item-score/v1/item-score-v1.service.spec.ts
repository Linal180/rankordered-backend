import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ItemScore } from '../schemas/item-score.schema';
import { ItemScoreV1Service } from './item-score-v1.service';

describe('ItemScoreV1Service', () => {
    let service: ItemScoreV1Service;
    let model: Model<ItemScore>;

    const mockItemScore: ItemScore = {
        itemId: 'cont123',
        categoryId: 'cat123',
        score: 100
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemScoreV1Service,
                {
                    provide: getModelToken(ItemScore.name),
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn().mockResolvedValue(mockItemScore),
                        deleteMany: jest.fn(),
                        exec: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ItemScoreV1Service>(ItemScoreV1Service);
        model = module.get<Model<ItemScore>>(getModelToken(ItemScore.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all score by filter', async (done) => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockItemScore])
            } as any);

            const scores = await service.findAll();

            expect(spy).toBeCalledTimes(1);
            expect(scores.status).toBe(OperationResult.fetch);

            done();
        });
    });

    describe('findById', () => {
        it('should return score by id', async (done) => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockItemScore)
            } as any);

            const score = await service.findById('cont123');

            expect(score.status).toBe(OperationResult.fetch);
            expect(spy).toBeCalledTimes(1);

            done();
        });

        it('should throw error when score not found', async (done) => {
            const spy = jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findById('cont123');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('findByItemIdAndCategoryId', () => {
        it('should return latest score by item id and category id', async (done) => {
            const spy = jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockItemScore)
            } as any);

            const score = await service.findByItemIdAndCategoryId(
                'cont123',
                'cat123'
            );

            expect(score.categoryId).toBe('cat123');
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('updateScore', () => {
        it('should create latest score by category and item id', async (done) => {
            const score = await service.updateScore('cont123', 'cat123', 1000);

            expect(jest.spyOn(model, 'create')).toBeCalledTimes(1);
            expect(score.categoryId).toBe('cat123');

            done();
        });
    });

    describe('findAndCreateScore', () => {
        it('find score by item id and category and return score', async (done) => {
            const spy = jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockItemScore)
            } as any);

            const score = await service.findAndCreateScore('cont123', 'cat123');

            expect(spy).toBeCalledTimes(1);
            expect(score.categoryId).toBe('cat123');

            done();
        });

        it('find score by item id and category and create score', async (done) => {
            const spy = jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            const createSpy = jest
                .spyOn(model, 'create')
                .mockResolvedValueOnce(mockItemScore as never);

            const score = await service.findAndCreateScore('cont123', 'cat123');

            expect(spy).toBeCalledTimes(1);
            expect(createSpy).toBeCalledTimes(1);
            expect(score.categoryId).toBe('cat123');

            done();
        });
    });

    describe('deleteScoreByItemId', () => {
        it('should delete score by item id', async (done) => {
            const spy = jest.spyOn(model, 'deleteMany').mockReturnValue({
                exec: jest.fn()
            } as any);

            await service.deleteScoreByItemId('123');

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });
});
