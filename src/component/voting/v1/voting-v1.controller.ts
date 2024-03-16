import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVotingItemDto } from '../dto/CreateVotingItem.dto';
import { VotingItemDto } from '../dto/VotingItem.dto';
import { VotingV1Service } from './voting-v1.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';
import { OptionalJwtAuthGuard } from 'src/component/auth/optional-user-guard';

@ApiTags('Votings')
@Controller({ path: 'voting', version: '1' })
export class VotingV1Controller {
  constructor(private votingService: VotingV1Service) { }

  @Get('delete-votes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  deleteSnapScore(
    @Body('date') date: string
  ) {
    return this.votingService.deleteRecordsAfterDate(date);
  }

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
  @UseGuards(OptionalJwtAuthGuard)
  async createVotingItem(
    @Req()
    request: any,
    @Body()
    createVotingData: CreateVotingItemDto
  ): Promise<VotingItemDto> {
    const userId = request?.user?.userId || '';

    return await this.votingService.updateVoting(
      request,
      createVotingData.categoryId,
      createVotingData.contestantId,
      createVotingData.opponentId,
      createVotingData.winnerId,
      userId
    )
  }
}