import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../schemas/FiletType';

export class GalleryDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    path: string;

    @ApiProperty()
    type: FileType;
}
