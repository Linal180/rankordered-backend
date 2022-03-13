import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateVotingItemDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    contestantId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    opponentId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    winnerId: string;
}
