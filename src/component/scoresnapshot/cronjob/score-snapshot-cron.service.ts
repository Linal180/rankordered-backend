import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';
import { ScoreSnapshotV1Service } from '../v1/score-snapshot-v1.service';

@Injectable()
export class ScoreSnapshotCronService {
    private readonly logger = new Logger(ScoreSnapshotCronService.name);

    constructor(
        private categoryService: CategoryV1Service,
        private scoreSnapshotService: ScoreSnapshotV1Service,
        @InjectQueue('score_snapshot')
        private scoreSnapshotQueue: Queue
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.log('saving current score and ranking');
        await this.saveItemScoreAndRanking();
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSnapshotCleanupCron() {
        this.logger.log('clean up snapshot which is more than 2 months');
    }

    async saveItemScoreAndRanking() {
        try {
            const { data } = await this.categoryService.findByQuery({
                active: true
            });

            data.forEach((category) => {
                this.scoreSnapshotQueue.add('saveScoreByCategory', category, {
                    removeOnComplete: true,
                    removeOnFail: true
                });
            });
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
