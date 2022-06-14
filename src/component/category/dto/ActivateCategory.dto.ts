import { ApiProperty } from '@nestjs/swagger';

export class activateCategoryDto {
    @ApiProperty({ example: true })
    active: boolean;
}
