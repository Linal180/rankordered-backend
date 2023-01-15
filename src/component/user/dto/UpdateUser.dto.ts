import {
    IntersectionType,
    OmitType,
    PartialType,
    PickType
} from '@nestjs/swagger';
import { CreateUserDto } from './CreateUser.dto';
import { UserDto } from './User.dto';

export class UpdateUserDto extends PartialType(
    IntersectionType(
        OmitType(UserDto, ['_id'] as const),
        PickType(CreateUserDto, ['password'] as const)
    )
) {}
