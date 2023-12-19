import { ApiProperty } from "@nestjs/swagger";

export class PrimaryProfileDto {

  @ApiProperty()
  provider: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  profilePicture: string;
}