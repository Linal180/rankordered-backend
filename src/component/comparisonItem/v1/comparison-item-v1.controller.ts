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
import { ActivateComparisonItemDto } from '../dto/ActivateComparisonItem.dto';
import { OperationResult } from 'src/shared/mongoResult/OperationResult';
import { HttpCacheInterceptor } from 'src/shared/request/HttpCache.Interceptor';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';
import { ComparisonItem } from '../schemas/ComparisonItem.schema';

@ApiTags('Comparison Items')
@Controller({ path: 'comparison-item', version: '1' })
@UseInterceptors(TransformInterceptor)
export class ComparisonItemV1Controller {
    constructor(private itemService: ComparisonItemV1Service) { }

    @Get('delete-scores')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    deleteSnapScore(
        @Body('date') date: string
    ) {
        return this.itemService.deleteRecordsAfterDate(date);
    }

    @Get()
    @UseInterceptors(HttpCacheInterceptor)
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String
    })
    getComparisonItems(
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
        return this.itemService.findAllWithRankingfromSnapshotOptimized({
            categoryId,
            pagination,
            search,
            active
        });
    }

    @Get('check-active')
    getItemsActivationStatus(): Promise<MongoResultQuery<boolean>> {
        return this.itemService.checkItemsActivationStatus();
    }

    @Get('list')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean
    })
    getComparisonItemList(
        @Query(
            new ValidationPipe({
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true
                }
            })
        )
        pagination: PaginationDto,
        @Query('categoryId') categoryid?: string,
        @Query('active') active?: boolean
    ) {
        const filter: any = {};

        if (categoryid) {
            filter.category = categoryid;
        }

        if (active !== undefined) {
            filter.active = active;
        }

        return this.itemService.findByQuery({
            filter: filter,
            page: pagination.currentPage,
            limit: pagination.limit
        });
    }

    @Get('admin')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean
    })
    getComparisonItemsForAdmin(
        @Query(
            new ValidationPipe({
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true
                }
            })
        )
        pagination: PaginationDto,
        @Query('categoryId') categoryid?: string,
        @Query('search') search?: string,
        @Query('active') active?: boolean
    ) {
        const filter: any = {};

        if (categoryid) {
            filter.category = categoryid;
        }

        if (search && search.length) {
            filter.name = new RegExp(search, 'i');
        }

        if (active !== undefined) {
            filter.active = active;
        }

        return this.itemService.findByQuery({
            filter: filter,
            page: pagination.currentPage,
            limit: pagination.limit
        });
    }

    @Get(':id')
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: String
    })
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    createComparisonItem(
        @Body() createItemData: CreateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.createItem(createItemData);
    }

    @Put('activate-all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    updateActivateAllItem(
        @Body() data: ActivateComparisonItemDto
    ): Promise<{ status: OperationResult }> {
        return this.itemService.toggleActiveAllItem(data.active);
    }

    @Put('activate/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    updateComparisonItemStatus(
        @Param('id') id: string,
        @Body() data: ActivateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.toggleActiveComparisonItem(id, data.active);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    updateComparisonItem(
        @Param('id') id: string,
        @Body() updateItemData: UpdateComparisonItemDto
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.updateItem(id, updateItemData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    deleteComparisonItem(
        @Param('id') id: string
    ): Promise<MongoResultQuery<ComparisonItemDto>> {
        return this.itemService.deleteItem(id);
    }
}
