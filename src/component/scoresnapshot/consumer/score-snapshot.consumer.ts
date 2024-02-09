import { Injectable, Logger } from '@nestjs/common';
import { ComparisonItemV1Service } from 'src/component/comparisonItem/v1/comparison-item-v1.service';
import { DateTime } from 'luxon';
import { Job } from 'bull';
import { CategoryDocument } from 'src/component/category/schemas/category.schema';
import { ScoreSnapshotV1Service } from '../v1/score-snapshot-v1.service';
import { CreateSnapshotDto } from '../dto/CreateSnapshot.dto';
import { CategoryV1Service } from 'src/component/category/v1/category-v1.service';

// @Processor('score_snapshot')
@Injectable()
export class ScoreSnapshotConsumer {
    private readonly logger = new Logger(ScoreSnapshotConsumer.name);

    constructor(
        private comparisonItemService: ComparisonItemV1Service,
        private scoreSnapshotService: ScoreSnapshotV1Service,
        private categoryService: CategoryV1Service
    ) { }

    // @Process('saveScoreByCategory')
    async handleSaveScoreByCategory(job: Job<CategoryDocument>) {
        try {
            const today = DateTime.now().toUTC().startOf('day');
            let page = 1;
            console.log("*************************** Starting Score and Ranking Sync *********************")
            this.logger.log(
                `saving score and ranking of category ${job.data._id} in ${today.toString()}`
            );

            let haveNextPage: boolean;
            let total = 0;

            do {
                const { data, count } =
                    await this.comparisonItemService.findAllWithRanking({
                        categoryId: job.data._id,
                        active: true,
                        pagination: {
                            page: page,
                            limit: 10,
                            currentPage: page - 1
                        }
                    });
                console.log("***********************************")
                data.forEach(async (item) => {
                    if (item.score.score) {
                        console.log(item.name, ":", item.ranking)
                        await this.scoreSnapshotService.addSnapshot(
                            CreateSnapshotDto.create({
                                itemId: item._id,
                                categoryId: job.data._id,
                                score: item.score.score,
                                ranking: item.ranking,
                                date: today.toJSDate()
                            })
                        );
                    }
                });
                console.log("***********************************")


                total += data.length;

                console.log(`total data: ${total}, count is ${count}`);
                page += 1;
                haveNextPage = total < count;
            } while (haveNextPage);

            const { data } =
                await this.comparisonItemService.findAllWithRankingfromSnapshot(
                    {
                        categoryId: job.data._id,
                        pagination: {
                            limit: await this.comparisonItemService.getComparisonItemTotalCount(),
                            currentPage: 0,
                            page: 1
                        }
                    }
                );

            await this.categoryService.updateCategory(job.data._id, {
                categoryRankingItems: data
                    .sort((first, second) => first.ranking - second.ranking)
                    .map((item) => ({
                        itemId: item._id,
                        scoreSnapshot: item.scoreSnapshot
                            .map((snapshot) => (snapshot as any)._id as string)
                            .filter((v) => !!v)
                            .reverse()
                    }))
            });

            this.logger.log('saving snapshots complete');
            console.log("********** Score and ranking sync completed ****************")
        } catch (error) {
            this.logger.error('saving category scores error', error);
        }
    }
}
