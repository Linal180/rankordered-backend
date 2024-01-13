import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserType } from './UserType';

class CreateSocialProfileDto {

    @ApiProperty({ example: 'youtube' })
    @IsNotEmpty()
    provider?: string;

    @ApiProperty({ example: 'URL' })
    @IsNotEmpty()
    profilePicture?: string;
}

export class CreateUserDto extends CreateSocialProfileDto {
    @ApiProperty({ example: 'john smith' })
    name?: string;

    @ApiProperty({ example: 'johnsmith' })
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'johnsmith@email.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password@123' })
    @IsNotEmpty()
    password?: string;

    @ApiProperty({ example: 'admin' })
    @IsNotEmpty()
    type: UserType;
}
