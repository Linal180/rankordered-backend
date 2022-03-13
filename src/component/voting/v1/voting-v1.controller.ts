import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVotingItemDto } from '../dto/CreateVotingItem.dto';
import { VotingItemDto } from '../dto/VotingItem.dto';
import { VotingV1Service } from './voting-v1.service';

@ApiTags('Votings')
@Controller({ path: 'voting', version: '1' })
export class VotingV1Controller {
    constructor(private votingService: VotingV1Service) {}

    @Get('category/:categoryId')
    @ApiQuery({
        name: 'itemId',
        required: false,
        type: String
    })
    getVotingByCategoryId(
        @Param('categoryId') categoryId: string,
        @Query('itemId') itemId: string
    ) {
        return itemId
            ? this.votingService.findByItemId(itemId, categoryId)
            : this.votingService.findByCategoryId(categoryId);
    }

    @Post()
    createVotingItem(
        @Body()
        createVotingData: CreateVotingItemDto
    ): Promise<VotingItemDto> {
        return this.votingService.updateVoting(
            createVotingData.categoryId,
            createVotingData.contestantId,
            createVotingData.opponentId,
            createVotingData.winnerId
        );
    }
}
