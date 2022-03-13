import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from '../../user/dto/User.dto';

@Exclude()
export class LoginResponseDto {
    @Expose()
    @ApiProperty()
    access_token: string;

    @Expose()
    @ApiProperty()
    refresh_token: string;

    @Expose()
    @ApiProperty()
    login_user: UserDto;
}

@Exclude()
export class LoginRequestDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    username: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    password: string;
}

@Exclude()
export class RefreshRequestDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    refresh_token: string;
}
