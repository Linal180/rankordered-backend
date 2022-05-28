import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';

@Injectable()
export class ScoreSnapshotCronService {
    private readonly logger = new Logger(ScoreSnapshotCronService.name);

    constructor(
        private categoryService: CategoryV1Service,
        @InjectQueue('score_snapshot')
        private scoreSnapshotQueue: Queue
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.log('saving current score and ranking');
        await this.saveItemScoreAndRanking();
    }

    async saveItemScoreAndRanking() {
        try {
            const { data } = await this.categoryService.findByQuery();
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
}
