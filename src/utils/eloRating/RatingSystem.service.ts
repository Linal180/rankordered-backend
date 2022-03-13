import { Injectable } from '@nestjs/common';

@Injectable()
export class RatingSystemService {
    scaleFactor = 400;
    exponentBase = 10;
    kFactor = 40;

    calculateProbabilityOfWinning(
        selfRating: number,
        opponentRating: number,
        exponentBase: number = this.exponentBase,
        scaleFactor: number = this.scaleFactor
    ): number {
        return parseFloat(
            (
                1 /
                (1 +
                    Math.pow(
                        exponentBase,
                        (opponentRating - selfRating) / scaleFactor
                    ))
            ).toFixed(3)
        );
    }

    calculateNextRating(
        rating: number,
        expectedProbability: number,
        score: number,
        kFactor = 32
    ): number {
        return parseFloat(
            (rating + kFactor * (score - expectedProbability)).toFixed(3)
        );
    }

    calculateKFactor(totalComparison: number, rating: number) {
        return totalComparison < 30 ? 40 : rating < 2400 ? 20 : 10;
    }
}
