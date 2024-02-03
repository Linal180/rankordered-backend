import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVotingItemDto } from '../dto/CreateVotingItem.dto';
import { VotingItemDto } from '../dto/VotingItem.dto';
import { VotingV1Service } from './voting-v1.service';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';

@ApiTags('Votings')
@Controller({ path: 'voting', version: '1' })
export class VotingV1Controller {
  constructor(private votingService: VotingV1Service) { }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  getVotingCount(
    @Query('categoryId') categoryId: string,
  ) {
    return this.votingService.getVotingCount(categoryId)
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  getVotingStats(
    @Query('categoryId') categoryId: string,
  ) {
    return this.votingService.getVotingStats(categoryId)
  }

  @Get('visits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  getVisitStats() {
    return this.votingService.getVisitStats()
  }

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
