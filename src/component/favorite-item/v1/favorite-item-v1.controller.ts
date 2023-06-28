import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/component/auth/jwt-auth.guard';
import { MongoResultQuery } from 'src/shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from 'src/shared/response/interceptors/Transform.interceptor';
import { FavoriteDto } from '../dto/index.dto';
import { FavoriteItemV1Service } from './favorite-item-v1.service';
import { ComparisonItem } from 'src/component/comparisonItem/schemas/ComparisonItem.schema';
import { PaginationDto } from 'src/shared/pagination/Pagination.dto';

@ApiTags('FavoriteItem')
@Controller({ version: '1', path: 'favorite-item' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
export class FavoriteItemV1Controller {
  constructor(private itemService: FavoriteItemV1Service) { }

  @Get()
  async get(
    @Req() request: any,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true
        }
      })
    )
    pagination: PaginationDto,
    @Query('categoryId') categoryId?: string,
    @Query('active') active?: boolean,
    @Query('search') search?: string
  ): Promise<MongoResultQuery<ComparisonItem[]>> {
    const { user } = request;
    const filter = {
      userId: user.userId,
      pagination,
      search, categoryId
    }

    return await this.itemService.get(filter)
  }

  @Post()
  async create(
    @Req() request: any,
    @Body() favoriteCreateDto: FavoriteDto
  ): Promise<any> {
    const { user } = request;
    const { itemId } = favoriteCreateDto
    return await this.itemService.create(user.userId, itemId)
  }

  @Delete(':id')
  async delete(
    @Req() request: any,
    @Param('id') id: string
  ): Promise<any> {
    const { user } = request;
    return await this.itemService.delete(user.userId, id)
  }
}
