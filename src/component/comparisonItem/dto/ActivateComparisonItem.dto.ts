import { ApiProperty } from '@nestjs/swagger';

export class ActivateComparisonItemDto {
    @ApiProperty({ example: true })
    active: boolean;
}
