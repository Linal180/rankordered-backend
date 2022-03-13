import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'only upload image up to 200MB'
    })
    image: any;
}
