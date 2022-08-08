import { ApiProperty } from '@nestjs/swagger';

export class UpdateGalleryDto {
    @ApiProperty()
    author: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    url: string;

    @ApiProperty()
    license: string;
}
