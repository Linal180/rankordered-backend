import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import { ItemScoreDto } from '../dto/ItemScore.dto';
import { ItemScoreV1Service } from './item-score-v1.service';

@ApiTags('Item Scores')
@Controller({ path: 'item-score', version: '1' })
@UseInterceptors(TransformInterceptor)
export class ItemScoreV1Controller {
    constructor(private scoreService: ItemScoreV1Service) {}

    @Get('item/:id')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    getScoreById(
        @Param('id') id: string,
        @Query('categoryId') categoryId: string
    ): Promise<MongoResultQuery<ItemScoreDto[]>> {
        // eslint-disable-next-line prefer-const
        let filter: any = { itemId: id };

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        return this.scoreService.findAll(filter, { createdAt: -1 });
    }

    @Get('category/:categoryId')
    getScoreByCategory(
        @Param('categoryId') categoryId: string
    ): Promise<MongoResultQuery<ItemScoreDto[]>> {
        return this.scoreService.findAll(
            { categoryId: categoryId },
            { createdAt: -1 }
        );
    }
}
