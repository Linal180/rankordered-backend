import { FileUploadDto } from '../../comparisonItem/dto/FileUpload.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryDto extends FileUploadDto {
    @ApiProperty({ required: false })
    name?: string;
}
