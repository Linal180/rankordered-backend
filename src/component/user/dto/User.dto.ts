import { ApiProperty } from '@nestjs/swagger';
import { UserType } from './UserType';
import { PrimaryProfileDto } from 'src/component/social-provider/dto/PrimaryProfile.dto';

export class UserDto {
    @ApiProperty()
    readonly _id?: string;

    @ApiProperty({ example: 'john smith' })
    name: string;

    @ApiProperty({ example: 'johnsmith' })
    username: string;

    @ApiProperty({ example: 'johnsmith@email.com' })
    email: string;

    @ApiProperty({ example: 'admin' })
    type: UserType;

    @ApiProperty({ example: '' })
    token?: string;
}

export class GoogleUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    verified_email: boolean;

    @ApiProperty()
    name: string;

    @ApiProperty()
    given_name: string;

    @ApiProperty()
    family_name: string;

    @ApiProperty()
    picture: string;

    @ApiProperty()
    locale: string;
}

export class CurrentUserDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    profilePicture?: string;

    @ApiProperty()
    primaryProfile: PrimaryProfileDto;
}