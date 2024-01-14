import { Injectable } from '@nestjs/common';

@Injectable()
export class RatingSystemService {
    private readonly scaleFactor = 400;
    private readonly exponentBase = 10;
    private readonly kFactor = 40;

    calculateProbabilityOfWinning(
        selfRating: number,
        opponentRating: number
    ): number {
        return parseFloat(
            (
                1 /
                (1 +
                    Math.pow(
                        this.exponentBase,
                        (opponentRating - selfRating) / this.scaleFactor
                    ))
            ).toFixed(3)
        );
    }

    calculateNextRating(
        rating: number,
        expectedProbability: number,
        score: number
    ): number {
        return parseFloat(
            (rating + this.kFactor * (score - expectedProbability)).toFixed(3)
        );
    }

    calculateKFactor(totalComparison: number, rating: number) {
        const THRESHOLD_1 = 30;
        const THRESHOLD_2 = 2400;

        return totalComparison < THRESHOLD_1
            ? this.kFactor
            : rating < THRESHOLD_2
                ? 20
                : 10;
    }
}
