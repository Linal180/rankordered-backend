import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { ScoreSnapshotCronService } from '../cronjob/score-snapshot-cron.service';
import { ScoreSnapshot } from '../schemas/score-snapshot.schema';
import { ScoreSnapshotV1Service } from './score-snapshot-v1.service';

@ApiTags('Score Snapshot')
@Controller({ path: 'snapshot', version: '1' })
export class ScoreSnapshotV1Controller {
    constructor(
        private service: ScoreSnapshotV1Service,
        private cronService: ScoreSnapshotCronService
    ) {}

    @Get()
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
    testSnapshot() {
        return this.cronService.saveItemScoreAndRanking();
    }
}
