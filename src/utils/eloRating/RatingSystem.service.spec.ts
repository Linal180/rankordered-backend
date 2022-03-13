import { Test, TestingModule } from '@nestjs/testing';
import { RatingSystemService } from './RatingSystem.service';

describe('serviceService', () => {
    let service: RatingSystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RatingSystemService]
        }).compile();

        service = module.get<RatingSystemService>(RatingSystemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateProbabilityOfWinning', () => {
        it('when calculate the right probability when self higher', (done) => {
            const selfRating = 1500;
            const oppoRating = 1300;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            expect(probability).toBe(0.76);
            done();
        });

        it('when calculate right probability when opponent higher', (done) => {
            const selfRating = 1100;
            const oppoRating = 1600;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            expect(probability).toBe(0.053);
            done();
        });
    });

    describe('calculateNextRating', () => {
        it('when calculate next rating for self when self win and self higher rating', (done) => {
            const selfRating = 1500;
            const oppoRating = 1300;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            const nextRating = service.calculateNextRating(
                selfRating,
                probability,
                1
            );

            expect(nextRating).toBe(1507.68);
            done();
        });

        it('when calculate next rating for self when self win and self lower', (done) => {
            const selfRating = 1100;
            const oppoRating = 1600;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            const nextRating = service.calculateNextRating(
                selfRating,
                probability,
                1
            );

            expect(nextRating).toBe(1130.304);
            done();
        });

        it('when calculate next rating for self when opponent win and self higher', (done) => {
            const selfRating = 1500;
            const oppoRating = 1300;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            const nextRating = service.calculateNextRating(
                selfRating,
                probability,
                0
            );

            expect(nextRating).toBe(1475.68);

            const opponentNextRating = service.calculateNextRating(
                oppoRating,
                1 - probability,
                1
            );

            expect(opponentNextRating).toBe(1324.32);
            done();
        });

        it('when calculate next rating for self when opponent win and self lower', (done) => {
            const selfRating = 1100;
            const oppoRating = 1600;

            const probability = service.calculateProbabilityOfWinning(
                selfRating,
                oppoRating
            );

            const nextRating = service.calculateNextRating(
                selfRating,
                probability,
                0
            );

            expect(nextRating).toBe(1098.304);
            done();
        });
    });

    describe('calculateKFactor', () => {
        it('when totalComparison is under 30', (done) => {
            const kfactor = service.calculateKFactor(10, 100);
            expect(kfactor).toBe(40);
            done();
        });

        it('when total rating already over 30 but rating lower then 2400', (done) => {
            const kfactor = service.calculateKFactor(40, 100);
            expect(kfactor).toBe(20);
            done();
        });

        it('when total rating already over 30 but rating higher then 2400', (done) => {
            const kfactor = service.calculateKFactor(40, 2400);
            expect(kfactor).toBe(10);
            done();
        });
    });
});
