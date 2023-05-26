import { ApiProperty } from '@nestjs/swagger';
import { ComparisonItemSourceDto } from './ComparisonItem.dto';

export class CreateComparisonItemDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiProperty({ required: false })
    category: string[];

    @ApiProperty()
    defaultCategory: string;

    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty({ required: false })
    foundedDate?: string;

    @ApiProperty({ required: false })
    website?: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    source?: ComparisonItemSourceDto;

    @ApiProperty({ required: false })
    label?: string[];

    @ApiProperty({ required: false })
    defaultImage?: string;

    @ApiProperty({ required: false })
    images?: string[];

    ranking?: number;
}
