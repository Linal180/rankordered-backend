import { Injectable } from '@nestjs/common';

@Injectable()


export class RatingSystemService {
    /*
        Here our ELO ranking system start. The flow is:
        1. Our system pick 2 colleges for voting competition.
        2. User vote for one of these colleges.
        3. Then, on existing score and ranking of these colleges, system update the score for the winner & loser.
    */

    // Static variables for ELO formula
    private readonly scaleFactor = 400;
    private readonly exponentBase = 10;
    private readonly kFactor = 40;

    /* 
        calculateProbabilityOfWinning function calculate the probability of winning 
        on the basis of current rating of both contestants (colleges).
    */
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

    /* 
        calculateNextRating function is for calculating the next/updated ranking 
        for the contestants (colleges).

        This function receives kFactor, if the value is not provided it will user
        32 as default value.
    */
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

    /*
        calculateKFactor function calculates KFactor for the contestants.
        if totalComparison is less than THRESHOLD_1 the it return 
            this.kFactor i:e, 40
        otherwise if rating is less than THRESHOLD_2, then it returns
            20
        and if rating is greater than THRESHOLD_2, then it will return
            10
    */
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


