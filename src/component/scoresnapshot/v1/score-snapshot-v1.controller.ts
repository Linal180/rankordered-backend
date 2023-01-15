import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { ScoreSnapshotCronService } from '../cronjob/score-snapshot-cron.service';
import { ScoreSnapshot } from '../schemas/score-snapshot.schema';
import { ScoreSnapshotV1Service } from './score-snapshot-v1.service';
import { Roles } from 'src/component/auth/roles.decorator';
import { UserType } from 'src/component/user/dto/UserType';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { RolesGuard } from 'src/component/auth/roles.guard';

@ApiTags('Score Snapshot')
@Controller({ path: 'snapshot', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScoreSnapshotV1Controller {
    constructor(
        private service: ScoreSnapshotV1Service,
        private cronService: ScoreSnapshotCronService
    ) {}

    @Get()
    @Roles(UserType.ADMIN)
    @ApiQuery({
        name: 'itemId',
        required: true,
        type: String
    })
    @ApiQuery({
        name: 'categoryId',
        required: true,
        type: String
    })
    handleGetScoreSnashot(
        @Query('itemId') itemId: string,
        @Query('categoryId') categoryid: string
    ): Promise<MongoResultQuery<ScoreSnapshot[]>> {
        return this.service.getSnapshot(itemId, categoryid);
    }

    @Post()
    @Roles(UserType.ADMIN)
    testSnapshot() {
        return this.cronService.saveItemScoreAndRanking();
    }
}
