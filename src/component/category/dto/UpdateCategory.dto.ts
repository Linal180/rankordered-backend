import { PartialType } from '@nestjs/swagger';
import { CategoryDto } from './Category.dto';

export class UpdateCategoryDto extends PartialType(CategoryDto) {
    // @ApiProperty({ example: 'college', required: false })
    // name?: string = null;
    // @ApiProperty({ example: 'college', required: false })
    // slug?: string = null;
    // @ApiProperty({ example: 'abc123', required: false })
    // parentId?: string = null;
}
