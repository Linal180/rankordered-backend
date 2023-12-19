import {
    Body,
    Controller,
    Get,
    Put,
    Req,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { UpdateUserDto } from 'src/component/user/dto/UpdateUser.dto';
import { UserDto } from 'src/component/user/dto/User.dto';
import { Userv1Service } from 'src/component/user/v1/userv1.service';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from 'src/shared/response/interceptors/Transform.interceptor';

@ApiTags('Profile')
@Controller({ version: '1', path: 'profile' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
export class ProfileV1Controller {
    constructor(private userService: Userv1Service) { }

    @Get()
    async getProfile(@Req() request: any): Promise<MongoResultQuery<UserDto>> {
        const { user } = request;
        const userProfile = await this.userService.findById(user.userId);
        return userProfile;
    }

    @Put()
    async updateProfile(
        @Req() request: any,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<MongoResultQuery<UserDto>> {
        const { user } = request;
        return this.userService.updateUser(user.userId, updateUserDto);
    }
}
