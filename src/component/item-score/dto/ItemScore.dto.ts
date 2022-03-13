import { ApiProperty } from '@nestjs/swagger';

export class ItemScoreDto {
    @ApiProperty()
    readonly _id?: string;

    @ApiProperty()
    readonly itemId: string;

    @ApiProperty()
    readonly categoryId: string;

    @ApiProperty()
    readonly score: number;
}
