import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FavoriteDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  itemId: string;
}
