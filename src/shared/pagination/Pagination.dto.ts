import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PaginationDto {
    @ApiProperty({ description: 'page number', example: 1, default: 1 })
    @IsNumber()
    @Type(() => Number)
    page: number;

    @ApiProperty({
        description: 'number of data per query',
        example: 10,
        default: 10
    })
    @IsNumber()
    @Type(() => Number)
    limit: number;

    get currentPage() {
        return this.page < 1 ? 0 : this.page - 1;
    }
}
