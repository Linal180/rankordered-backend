import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';
import { ScoreSnapshotV1Service } from '../v1/score-snapshot-v1.service';
import { ScoreSnapshotConsumer } from '../consumer/score-snapshot.consumer';
import { CategoryDocument } from 'src/component/category/schemas/category.schema';

@Injectable()
export class ScoreSnapshotCronService {
    private readonly logger = new Logger(ScoreSnapshotCronService.name);

    constructor(
        private categoryService: CategoryV1Service,
        private scoreSnapshotService: ScoreSnapshotV1Service,
        // @InjectQueue('score_snapshot')
        private scoreSnapshotQueue: ScoreSnapshotConsumer
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.log('saving current score and ranking');
        await this.saveItemScoreAndRanking();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSnapshotCleanupCron() {
        this.logger.log('clean up snapshot which is more than 2 months');
        await this.houseKeepingSnapshot();
    }

    async saveItemScoreAndRanking() {
        try {
            const { data } = await this.categoryService.findByQuery({
                active: true
            });
            for (const category of data) {
                await this.scoreSnapshotQueue.handleSaveScoreByCategory({
                    data: category as CategoryDocument
                } as any);
            }
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async houseKeepingSnapshot() {
        try {
            const { deletedCount } =
                await this.scoreSnapshotService.houseKeepingSnapshot();

            if (deletedCount > 0) {
                this.logger.log(`${deletedCount} snapshot deleted`);
            }
        } catch (error) {
            this.logger.error(error.message);
        }
    }
}
