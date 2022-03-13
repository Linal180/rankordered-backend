import { PartialType } from '@nestjs/swagger';
import { CreateComparisonItemDto } from './CreateComparisonItem.dto';

export class UpdateComparisonItemDto extends PartialType(
    CreateComparisonItemDto
) {}
