import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
    @ApiProperty({ example: 'college' })
    name: string;

    @ApiProperty({ example: 'college' })
    slug: string;

    @ApiProperty({ example: 'abc123', required: false })
    parentId?: CategoryDto = null;
}
