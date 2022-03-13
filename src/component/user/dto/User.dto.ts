import { ApiProperty } from '@nestjs/swagger';
import { UserType } from './UserType';

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
}
