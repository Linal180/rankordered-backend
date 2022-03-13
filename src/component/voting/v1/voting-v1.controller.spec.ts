import { Test, TestingModule } from '@nestjs/testing';
import { Voting } from '../schemas/Voting.schema';
import { VotingV1Controller } from './voting-v1.controller';
import { VotingV1Service } from './voting-v1.service';

const mockVoting: Voting = {
    contestantId: 'cont123',
    contestantPreviousSCore: 0,
    contestantCurrentSCore: 30,
    opponentId: 'oppo123',
    opponentPreviousScore: 0,
    opponentCurrentSCore: 0,
    categoryId: 'cat123',
    winnerId: 'cont123'
};

describe('VotingV1Controller', () => {
    let controller: VotingV1Controller;
    let service: VotingV1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VotingV1Controller],
            providers: [
                {
                    provide: VotingV1Service,
                    useValue: {
                        findByItemId: jest.fn().mockResolvedValue([mockVoting]),
                        findByCategoryId: jest
                            .fn()
                            .mockResolvedValue([mockVoting]),
                        updateVoting: jest.fn().mockResolvedValue(mockVoting)
                    }
                }
            ]
        }).compile();

        controller = module.get<VotingV1Controller>(VotingV1Controller);
        service = module.get<VotingV1Service>(VotingV1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getVotingByCategoryId', () => {
        it('should return voting by category and item', async (done) => {
            const votings = await controller.getVotingByCategoryId(
                'cat123',
                'cont123'
            );

            expect(votings[0].categoryId).toBe('cat123');
            expect(jest.spyOn(service, 'findByItemId')).toBeCalledTimes(1);
            expect(jest.spyOn(service, 'findByCategoryId')).toBeCalledTimes(0);
            done();
        });

        it('should return voting by category', async (done) => {
            const votings = await controller.getVotingByCategoryId(
                'cat123',
                null
            );

            expect(votings[0].categoryId).toBe('cat123');
            expect(jest.spyOn(service, 'findByItemId')).toBeCalledTimes(0);
            expect(jest.spyOn(service, 'findByCategoryId')).toBeCalledTimes(1);
            done();
        });
    });

    describe('createVotingItem', () => {
        it('should return voting after update vote', async (done) => {
            const voting = await controller.createVotingItem({
                categoryId: 'cat123',
                contestantId: 'cont123',
                opponentId: 'oppo123',
                winnerId: 'cont123'
            });

            expect(voting.categoryId).toBe('cat123');
            expect(jest.spyOn(service, 'updateVoting')).toBeCalledTimes(1);
            done();
        });
    });
});
