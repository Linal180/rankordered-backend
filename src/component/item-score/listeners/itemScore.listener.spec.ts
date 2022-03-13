import { Test, TestingModule } from '@nestjs/testing';
import { ComparisonItemCreatedEvent } from '../../comparisonItem/events/ComparisonItemCreated.event';
import { ComparisonItemDeletedEvent } from '../../comparisonItem/events/ComparisonItemDeleted.event';
import { ComparisonItemUpdatedEvent } from '../../comparisonItem/events/ComparisonItemUpdated.event';
import { VotingCreatedEvent } from '../../voting/events/VotingCreated.event';
import { ItemScoreV1Service } from '../v1/item-score-v1.service';
import { ItemScoreListener } from './ItemScore.listener';

describe('ItemScoreListener', () => {
    let listener: ItemScoreListener;
    let service: ItemScoreV1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemScoreListener,
                {
                    provide: ItemScoreV1Service,
                    useValue: {
                        findAndCreateScore: jest.fn(),
                        updateScore: jest.fn(),
                        deleteScoreByItemId: jest.fn()
                    }
                }
            ]
        }).compile();

        listener = module.get<ItemScoreListener>(ItemScoreListener);
        service = module.get<ItemScoreV1Service>(ItemScoreV1Service);
    });

    it('should be defined', () => {
        expect(listener).toBeDefined();
    });

    describe('handleComparisonItemCreatedEvent', () => {
        it('should handle comparison item created', async (done) => {
            const createdItem = ComparisonItemCreatedEvent.create({
                id: 'cont123',
                category: ['cat123']
            });

            listener.handleComparisonItemCreatedEvent(createdItem);

            createdItem.category.forEach((category) => {
                expect(
                    jest.spyOn(service, 'findAndCreateScore')
                ).toBeCalledWith(createdItem.id, category);
            });

            done();
        });

        it('should not create score if not category', async (done) => {
            const createdItem = ComparisonItemCreatedEvent.create({
                id: 'cont123',
                category: []
            });

            listener.handleComparisonItemCreatedEvent(createdItem);

            expect(jest.spyOn(service, 'findAndCreateScore')).not.toBeCalled();

            done();
        });
    });

    describe('handleComparisonItemUpdatedEvent', () => {
        it('should handle update item', async (done) => {
            const updatedItem = ComparisonItemUpdatedEvent.create({
                id: 'cont123',
                category: ['cat123', 'cat456']
            });

            listener.handleComparisonItemUpdatedEvent(updatedItem);

            updatedItem.category.forEach((category) => {
                expect(
                    jest.spyOn(service, 'findAndCreateScore')
                ).toBeCalledWith(updatedItem.id, category);
            });

            done();
        });

        it('should not create score if updated not have category', async (done) => {
            const updatedItem = ComparisonItemUpdatedEvent.create({
                id: 'cont123',
                category: []
            });

            listener.handleComparisonItemUpdatedEvent(updatedItem);

            expect(jest.spyOn(service, 'findAndCreateScore')).not.toBeCalled();

            done();
        });
    });

    describe('handleVotingItemCreatedEvent', () => {
        it('should handle voting item created', async (done) => {
            const createdVoting = VotingCreatedEvent.create({
                contestantId: 'cont123',
                contestantCurrentSCore: 100,
                opponentId: 'oppo123',
                opponentCurrentSCore: 100,
                categoryId: 'cat123'
            });

            await listener.handleVotingItemCreatedEvent(createdVoting);

            expect(jest.spyOn(service, 'updateScore')).toBeCalledWith(
                createdVoting.contestantId,
                createdVoting.categoryId,
                createdVoting.contestantCurrentSCore
            );

            expect(jest.spyOn(service, 'updateScore')).toBeCalledWith(
                createdVoting.contestantId,
                createdVoting.categoryId,
                createdVoting.contestantCurrentSCore
            );

            done();
        });
    });

    describe('handleComparisonItemDeleted', () => {
        it('should handle comparison item deleted', async (done) => {
            const deletedEvent = ComparisonItemDeletedEvent.create({
                id: '123'
            });

            listener.handleComparisonItemDeleted(deletedEvent);

            expect(jest.spyOn(service, 'deleteScoreByItemId')).toBeCalledTimes(
                1
            );

            done();
        });
    });
});
