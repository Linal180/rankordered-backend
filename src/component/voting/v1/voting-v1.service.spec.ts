import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { RatingSystemService } from '../../../utils/eloRating/RatingSystem.service';
import { ItemScoreV1Service } from '../../item-score/v1/item-score-v1.service';
import { Voting } from '../schemas/Voting.schema';
import { VotingV1Service } from './voting-v1.service';

const mockVoting: Voting = {
    contestantId: 'cont123',
    contestantPreviousSCore: 0,
    contestantCurrentSCore: 0,
    opponentId: 'oppo123',
    opponentPreviousScore: 0,
    opponentCurrentSCore: 0,
    categoryId: 'cat123',
    winnerId: 'cont123'
};

describe('VotingV1Service', () => {
    let service: VotingV1Service;
    let model: Model<Voting>;
    let scoreService: ItemScoreV1Service;
    let eventEmitter: EventEmitter2;
    let ratingSystem: RatingSystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotingV1Service,
                {
                    provide: getModelToken(Voting.name),
                    useValue: {
                        find: jest.fn(),
                        sort: jest.fn(),
                        exec: jest.fn(),
                        create: jest.fn()
                    }
                },
                {
                    provide: ItemScoreV1Service,
                    useValue: {
                        findByItemIdAndCategoryId: jest.fn()
                    }
                },
                {
                    provide: RatingSystemService,
                    useValue: {
                        calculateKFactor: jest.fn(),
                        calculateProbabilityOfWinning: jest.fn(),
                        calculateNextRating: jest.fn()
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

        service = module.get<VotingV1Service>(VotingV1Service);
        model = module.get<Model<Voting>>(getModelToken(Voting.name));
        scoreService = module.get<ItemScoreV1Service>(ItemScoreV1Service);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        ratingSystem = module.get<RatingSystemService>(RatingSystemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByItemId', () => {
        it('should return voting by id', async (done) => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([mockVoting])
                })
            } as any);

            const items = await service.findByItemId('123456', '123455');

            expect(spy).toBeCalledTimes(1);
            expect(items.length).toBe(1);
            done();
        });
    });

    describe('findByCategoryId', () => {
        it('should return voting by category', async (done) => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([mockVoting])
                })
            } as any);

            const items = await service.findByCategoryId('123456');

            expect(spy).toBeCalledTimes(1);
            expect(items.length).toBe(1);

            done();
        });
    });

    describe('updateVoting', () => {
        it('should return updated voting', async (done) => {
            const scoreSpy = jest
                .spyOn(scoreService, 'findByItemIdAndCategoryId')
                .mockResolvedValueOnce({
                    itemId: 'oppo123',
                    categoryId: 'cat123',
                    score: 900
                })
                .mockResolvedValueOnce({
                    itemId: 'cont123',
                    categoryId: 'cat123',
                    score: 1100
                });

            const comparisonspy = jest.spyOn(model, 'find').mockReturnValue({
                count: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(10)
                })
            } as any);

            const ratingSpy = jest
                .spyOn(ratingSystem, 'calculateNextRating')
                .mockResolvedValueOnce(100 as never)
                .mockResolvedValueOnce(200 as never);

            const votingSpy = jest
                .spyOn(model, 'create')
                .mockResolvedValue(mockVoting as never);

            const vote = await service.updateVoting(
                'cat123',
                'cont123',
                'oppo123',
                'cont123'
            );

            expect(scoreSpy).toBeCalledTimes(2);
            expect(comparisonspy).toBeCalledTimes(1);
            expect(votingSpy).toBeCalledTimes(1);
            expect(ratingSpy).toBeCalledTimes(2);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(1);
            expect(vote.contestantId).toBe('cont123');

            done();
        });

        it('should return 0 even when current score negative', async (done) => {
            const scoreSpy = jest
                .spyOn(scoreService, 'findByItemIdAndCategoryId')
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            const comparisonspy = jest.spyOn(model, 'find').mockReturnValue({
                count: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(10)
                })
            } as any);

            const ratingSpy = jest
                .spyOn(ratingSystem, 'calculateNextRating')
                .mockReturnValue(-100 as never);

            const votingSpy = jest
                .spyOn(model, 'create')
                .mockResolvedValue(mockVoting as never);

            const vote = await service.updateVoting(
                'cat123',
                'cont123',
                'oppo123',
                'oppo123'
            );

            expect(scoreSpy).toBeCalledTimes(2);
            expect(comparisonspy).toBeCalledTimes(1);
            expect(votingSpy).toBeCalledTimes(1);
            expect(ratingSpy).toBeCalledTimes(2);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(1);
            expect(vote.contestantCurrentSCore).toBe(0);

            done();
        });

        it('should throw error if failed creating voting', async (done) => {
            const scoreSpy = jest
                .spyOn(scoreService, 'findByItemIdAndCategoryId')
                .mockResolvedValueOnce({
                    itemId: 'oppo123',
                    categoryId: 'cat123',
                    score: 900
                })
                .mockResolvedValueOnce({
                    itemId: 'cont123',
                    categoryId: 'cat123',
                    score: 1100
                });

            const comparisonspy = jest.spyOn(model, 'find').mockReturnValue({
                count: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(10)
                })
            } as any);

            const ratingSpy = jest
                .spyOn(ratingSystem, 'calculateNextRating')
                .mockResolvedValueOnce(100 as never)
                .mockResolvedValueOnce(200 as never);

            const votingSpy = jest
                .spyOn(model, 'create')
                .mockResolvedValue(null as never);

            try {
                await service.updateVoting(
                    'cat123',
                    'cont123',
                    'oppo123',
                    'cont123'
                );
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(scoreSpy).toBeCalledTimes(2);
            expect(comparisonspy).toBeCalledTimes(1);
            expect(votingSpy).toBeCalledTimes(1);
            expect(ratingSpy).toBeCalledTimes(2);
            expect(jest.spyOn(eventEmitter, 'emit')).toBeCalledTimes(0);

            done();
        });
    });
});
