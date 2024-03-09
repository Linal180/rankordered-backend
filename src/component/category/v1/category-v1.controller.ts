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
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import { CategoryDto } from '../dto/Category.dto';
import { CreateCategoryDto } from '../dto/CreateCategory.dto';
import { UpdateCategoryDto } from '../dto/UpdateCategory.dto';
import { CategoryV1Service } from './category-v1.service';
import { activateCategoryDto } from '../dto/ActivateCategory.dto';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';

@ApiTags('Categories')
@Controller({
    version: '1',
    path: 'category'
})
@UseInterceptors(TransformInterceptor)
export class CategoryV1Controller {
    constructor(private categoryService: CategoryV1Service) {}

    @Get()
    @ApiQuery({
        name: 'active',
        required: false,
        type: Boolean
    })
    getCategories(
        @Query('active') active?: boolean
    ): Promise<MongoResultQuery<CategoryDto[]>> {
        // eslint-disable-next-line prefer-const
        let filter: { active?: boolean } = {};

        if (active !== undefined) {
            filter.active = active;
        }

        return this.categoryService.findByQuery(filter);
    }

    @Get(':id')
    getCategory(
        @Param('id') id: string
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.findById(id);
    }

    @Get('url/:slug')
    getCategoryBySlug(
        @Param('slug') slug: string
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    createCategory(
        @Body() createCategoryData: CreateCategoryDto
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.createCategory(createCategoryData);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    updateCategory(
        @Param('id') id: string,
        @Body() updateCategoryData: UpdateCategoryDto
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.updateCategory(id, updateCategoryData);
    }

    @Put('activate/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    activateCategory(
        @Param('id') id: string,
        @Body() activeCategoryData: activateCategoryDto
    ) {
        return this.categoryService.toggleActiveCategory(
            id,
            activeCategoryData.active
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    deleteCategory(
        @Param('id') id: string
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.deleteCategory(id);
    }
}
