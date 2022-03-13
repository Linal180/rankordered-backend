import { ApiProperty } from '@nestjs/swagger';
import { ItemScoreDto } from '../../item-score/dto/ItemScore.dto';
import { ComparisonItemDto } from './ComparisonItem.dto';

export class ComparisonItemWithScore extends ComparisonItemDto {
    @ApiProperty()
    score: ItemScoreDto;
}
