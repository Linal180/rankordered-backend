import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVotingItemDto } from '../dto/CreateVotingItem.dto';
import { VotingItemDto } from '../dto/VotingItem.dto';
import { VotingV1Service } from './voting-v1.service';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';
import { VotingAbusedException } from 'src/shared/httpError/class/ObjectNotFound.exception';
import { Userv1Service } from 'src/component/user/v1/userv1.service';
import { OptionalJwtAuthGuard } from 'src/component/auth/optional-user-guard';
import { UserStatus } from 'src/component/user/dto/UserStatus.dto';

@ApiTags('Votings')
@Controller({ path: 'voting', version: '1' })
export class VotingV1Controller {
    constructor(
        private votingService: VotingV1Service,
        private userService: Userv1Service
    ) { }

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
        
        const userId = request?.user?.userId;
        let vote: VotingItemDto;
        
        if (userId) {
            const user = await this.userService.findById(userId);
            if(user?.data?.status === UserStatus.INACTIVE){
                throw new VotingAbusedException();
            }
             vote = await this.votingService.updateVoting(
                createVotingData.categoryId,
                createVotingData.contestantId,
                createVotingData.opponentId,
                createVotingData.winnerId,
                userId
            );

            const isVotingAbused = await this.votingService.isVotingAbused(userId);
            if (isVotingAbused) {
                await this.votingService.discardUserTodayVotes(userId);
                await this.userService.updateUserStatus(userId, UserStatus.INACTIVE);
                throw new VotingAbusedException();
            }
        } else {
            vote = await this.votingService.updateVoting(
                createVotingData.categoryId,
                createVotingData.contestantId,
                createVotingData.opponentId,
                createVotingData.winnerId,
            );
        }
        return vote;
    }
}
