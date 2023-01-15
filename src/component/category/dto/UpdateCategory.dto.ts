import { PartialType } from '@nestjs/swagger';
import { CategoryDto } from './Category.dto';

export class UpdateCategoryDto extends PartialType(CategoryDto) {}
