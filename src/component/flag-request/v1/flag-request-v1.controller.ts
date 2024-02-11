import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/shared/response/interceptors/Transform.interceptor';
import { FlagRequestV1Service } from './flag-request-v1.service';
import { PaginationDto } from 'src/shared/pagination/Pagination.dto';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { FlagRequest } from '../schema/index.schema';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';
import { config } from 'rxjs';

@ApiTags('Flag Requests')
@Controller({ path: 'flag-request', version: '1' })
@UseInterceptors(TransformInterceptor)
export class FlagRequestV1Controller {
  constructor(private flagRequestService: FlagRequestV1Service) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'status',
    required: false,
    type: String
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String
  })
  getFlagRequests(
    @Req() request: any,
    pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<MongoResultQuery<FlagRequest[]>> {
    const { user } = request;
    return this.flagRequestService.getAllFlagRequest({ user, status, search, pagination })
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createFlagRequest(
    @Body() { profileId }: { profileId: string },
    @Req() request: any,
  ): Promise<MongoResultQuery<FlagRequest>> {
    const { user } = request;
    return this.flagRequestService.create({ user, profileId })
  }

  @Post('/update-flag')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  acceptFlagRequest(
    @Body() { profileId }: { profileId: string },
    @Body() { status }: { status: 'approved' | 'rejected' }
  ): Promise<MongoResultQuery<any>> {
    console.log("?>>>>>>>>", status, profileId)
    return this.flagRequestService.updateRequest(profileId, status)
  }
}