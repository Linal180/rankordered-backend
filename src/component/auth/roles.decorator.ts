import { SetMetadata } from '@nestjs/common';
import { UserType } from '../user/dto/UserType';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
