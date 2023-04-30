import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from '../../user/dto/User.dto';
import { UserType } from 'src/component/user/dto/UserType';

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
export class SsoLoginRequestDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    accessToken: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    sso: 'youtube' | 'google' | 'instagram' | 'tiktok' | 'twitter' | 'snapchat' | 'pinterest';

}

@Exclude()
export class RefreshRequestDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    refresh_token: string;
}

@Exclude()
export class CreateSsoUserDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @Expose()
    @ApiProperty({ default: 'user@123' })
    @IsNotEmpty()
    password: string;

    @Expose()
    @ApiProperty({ default: 'user' })
    type: UserType;
}
