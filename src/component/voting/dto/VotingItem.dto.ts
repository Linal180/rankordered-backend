import { ApiProperty } from '@nestjs/swagger';

export class VotingItemDto {
    @ApiProperty()
    categoryId: string;

    @ApiProperty()
    contestantId: string;

    @ApiProperty()
    contestantPreviousSCore: number;

    @ApiProperty()
    contestantCurrentSCore: number;

    @ApiProperty()
    opponentId: string;

    @ApiProperty()
    opponentPreviousScore: number;

    @ApiProperty()
    opponentCurrentSCore: number;

    @ApiProperty()
    winnerId: string;
}
