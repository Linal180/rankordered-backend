import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from '../../category/dto/Category.dto';

class ComparisonItemSourceDto {
    @ApiProperty({ required: false, example: 'wikipedia' })
    source?: string;

    @ApiProperty({ required: false, example: 'wikipedia.com' })
    url?: string;
}
class ComparisonItemDto {
    @ApiProperty()
    readonly _id?: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    category: CategoryDto[];

    @ApiProperty()
    defaultCategory: CategoryDto;

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
}

export { ComparisonItemDto, ComparisonItemSourceDto };
