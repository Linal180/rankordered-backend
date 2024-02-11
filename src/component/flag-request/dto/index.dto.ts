import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from 'src/shared/pagination/Pagination.dto';

export class CreateFlagRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  user: string

  @ApiProperty()
  @IsNotEmpty()
  profile: string
}

export class GetFlagRequestsDTO {
  @ApiProperty()
  @IsNotEmpty()
  user?: any

  @ApiProperty()
  @IsNotEmpty()
  status?: string

  @ApiProperty()
  @IsNotEmpty()
  search?: string

  @ApiProperty()
  @IsNotEmpty()
  pagination: PaginationDto
}

export class UpdateFlagRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  profile: string

  @ApiProperty()
  @IsNotEmpty()
  status: string
}

export class DeleteFlagRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  _id: string
}
