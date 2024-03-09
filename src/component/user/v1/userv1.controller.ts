import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import { CreateUserDto, UpdateProfileDto } from '../dto/CreateUser.dto';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { UserDto } from '../dto/User.dto';
import { Userv1Service } from './userv1.service';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { Roles } from 'src/component/auth/roles.decorator';
import { UserType } from '../dto/UserType';

@ApiTags('Users')
@Controller({
    version: '1',
    path: 'user'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
export class Userv1Controller {
    constructor(private userService: Userv1Service) { }

    @Get()
    @Roles(UserType.ADMIN)
    getUsers(): Promise<MongoResultQuery<UserDto[]>> {
        return this.userService.findByQuery();
    }

    @Get(':id')
    @Roles(UserType.ADMIN)
    getUserById(@Param('id') id: string): Promise<MongoResultQuery<UserDto>> {
        return this.userService.findById(id);
    }

    @Post()
    @Roles(UserType.ADMIN)
    createUser(
        @Body() createUserDto: CreateUserDto
    ): Promise<MongoResultQuery<UserDto>> {
        return this.userService.createUser(createUserDto);
    }

    @Post('delete-profile-picture')
    @UseGuards(JwtAuthGuard)
    deleteProfilePicture(
        @Req() request: any,
    ): Promise<MongoResultQuery<UserDto>> {
        const { user } = request || {};

        return this.userService.deleteProfilePicture(user.userId);
    }

    @Post('update-profile')
    @UseGuards(JwtAuthGuard)
    updateProfile(
        @Body() userDto: UpdateProfileDto,
        @Req() request: any,
    ): Promise<MongoResultQuery<UserDto>> {
        const { user } = request || {};
        return this.userService.updateProfile(user.userId, userDto);
    }

    @Put(':id')
    @Roles(UserType.ADMIN)
    updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<MongoResultQuery<UserDto>> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserType.ADMIN)
    deleteUser(@Param('id') id: string): Promise<MongoResultQuery<UserDto>> {
        return this.userService.deleteUser(id);
    }
}
