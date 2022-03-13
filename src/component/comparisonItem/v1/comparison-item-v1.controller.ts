import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { PaginationDto } from '../../../shared/pagination/Pagination.dto';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import { ComparisonItemDto } from '../dto/ComparisonItem.dto';
import { CreateComparisonItemDto } from '../dto/CreateComparisonItem.dto';
import { UpdateComparisonItemDto } from '../dto/UpdateComparisonItem.dto';
import { ComparisonItemWithScore } from '../schemas/ComparisonItemWithScore';
import { ComparisonItemV1Service } from './comparison-item-v1.service';

@ApiTags('Comparison Items')
@Controller({ path: 'comparison-item', version: '1' })
@UseInterceptors(TransformInterceptor)
export class ComparisonItemV1Controller {
    constructor(private itemService: ComparisonItemV1Service) {}

    @Get()
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true
            }
        })
    )
    getComparisonItems(
        @Query() pagination: PaginationDto,
        @Query('categoryId') categoryid?: string
    ): Promise<MongoResultQuery<ComparisonItemWithScore[]>> {
        return this.itemService.findAllWithRanking(categoryid, pagination);
    }

    @Get(':id')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    getComparisonItem(
        @Param('id') id: string,
        @Query('categoryId') categoryid?: string
    ): Promise<MongoResultQuery<ComparisonItemWithScore>> {
        return this.itemService.findByIdWithRanking(id, categoryid);
    }

    @Get('url/:slug')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    getComparisonItemBySlug(
        @Param('slug') slug: string,
        @Query('categoryId') categoryid?: string
    ): Promise<MongoResultQuery<ComparisonItemWithScore>> {
        return this.itemService.findBySlugWithRanking(slug, categoryid);
    }

    @Get('compare/:categoryId')
    getComparisonByCategory(
        @Param('categoryId') categoryId: string
    ): Promise<MongoResultQuery<ComparisonItemDto[]>> {
        return this.itemService.getComparisonItem(categoryId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createComparisonItem(
        @Body() createItemData: CreateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.createItem(createItemData);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateComparisonItem(
        @Param('id') id: string,
        @Body() updateItemData: UpdateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.updateItem(id, updateItemData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    deleteComparisonItem(
        @Param('id') id: string
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.deleteItem(id);
    }
}
