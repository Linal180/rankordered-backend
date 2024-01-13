import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';


@Exclude()
export class ForgotPasswordPayload {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}

@Exclude()
export class ResetPasswordPayload {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

@Exclude()
export class ResetPasswordResponse {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  status: number;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  message: string;
}
