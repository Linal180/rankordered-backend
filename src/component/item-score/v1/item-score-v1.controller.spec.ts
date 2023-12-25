import { Test, TestingModule } from '@nestjs/testing';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ItemScore } from '../schemas/item-score.schema';
import { ItemScoreV1Controller } from './item-score-v1.controller';
import { ItemScoreV1Service } from './item-score-v1.service';

describe('ItemScoreV1Controller', () => {
    let controller: ItemScoreV1Controller;
    let service: ItemScoreV1Service;

    const mockItemScore: ItemScore = {
        itemId: 'cont123',
        categoryId: 'cat123',
        score: 100
    };

    const responseMany = {
        data: mockItemScore,
        status: OperationResult.fetch,
        count: 1
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ItemScoreV1Controller],
            providers: [
                {
                    provide: ItemScoreV1Service,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue(responseMany)
                    }
                }
            ]
        }).compile();

        controller = module.get<ItemScoreV1Controller>(ItemScoreV1Controller);
        service = module.get<ItemScoreV1Service>(ItemScoreV1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getScoreById', () => {
        it('should return score by item id', async () => {
            const scores = await controller.getScoreById('cont123', 'cat123');

            expect(jest.spyOn(service, 'findAll')).toBeCalledTimes(1);
            expect(scores.status).toBe(OperationResult.fetch);
        });

        it('should return score by item id and category is null', async () => {
            const scores = await controller.getScoreById('cont123', null);

            expect(jest.spyOn(service, 'findAll')).toBeCalledTimes(1);
            expect(scores.status).toBe(OperationResult.fetch);
        });
    });

    describe('getScoreByCategory', () => {
        it('should get scores by category', async () => {
            const scores = await controller.getScoreByCategory('cont123');

            expect(jest.spyOn(service, 'findAll')).toBeCalledTimes(1);
            expect(scores.status).toBe(OperationResult.fetch);
        });
    });
});
