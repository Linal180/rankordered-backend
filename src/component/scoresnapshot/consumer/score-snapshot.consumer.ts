import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ComparisonItemV1Service } from 'src/component/comparisonItem/v1/comparison-item-v1.service';
import { DateTime } from 'luxon';
import { Job } from 'bull';
import { CategoryDocument } from 'src/component/category/schemas/category.schema';
import { ScoreSnapshotV1Service } from '../v1/score-snapshot-v1.service';
import { CreateSnapshotDto } from '../dto/CreateSnapshot.dto';

@Processor('score_snapshot')
export class ScoreSnapshotConsumer {
    private readonly logger = new Logger(ScoreSnapshotConsumer.name);

    constructor(
        private comparisonItemService: ComparisonItemV1Service,
        private scoreSnapshotService: ScoreSnapshotV1Service
    ) {}

    @Process('saveScoreByCategory')
    async handleSaveScoreByCategory(job: Job<CategoryDocument>) {
        const today = DateTime.now().toUTC().startOf('day');
        let page = 1;
        this.logger.log(
            `saving score and ranking of category ${
                job.data._id
            } in ${today.toString()}`
        );

        let haveNextPage: boolean;

        do {
            const { data, count } =
                await this.comparisonItemService.findAllWithRanking({
                    categoryId: job.data._id,
                    pagination: {
                        page: page,
                        limit: 10,
                        currentPage: page - 1
                    }
                });

            data.forEach((item) => {
                this.scoreSnapshotService.addSnapshot(
                    CreateSnapshotDto.create({
                        itemId: item._id,
                        categoryId: job.data._id,
                        score: item.score.score,
                        ranking: item.ranking,
                        date: today.toJSDate()
                    })
                );
            });

            page += 1;
            haveNextPage = page * 10 < count;
        } while (haveNextPage);

        this.logger.log('saving snapshots complete');
    }
}
