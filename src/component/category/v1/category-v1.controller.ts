import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import { CategoryDto } from '../dto/Category.dto';
import { CreateCategoryDto } from '../dto/CreateCategory.dto';
import { UpdateCategoryDto } from '../dto/UpdateCategory.dto';
import { CategoryV1Service } from './category-v1.service';

@ApiTags('Categories')
@Controller({
    version: '1',
    path: 'category'
})
@UseInterceptors(TransformInterceptor)
export class CategoryV1Controller {
    constructor(private categoryService: CategoryV1Service) {}

    @Get()
    getCategories(): Promise<MongoResultQuery<CategoryDto[]>> {
        return this.categoryService.findByQuery();
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createCategory(
        @Body() createCategoryData: CreateCategoryDto
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.createCategory(createCategoryData);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateCategory(
        @Param('id') id: string,
        @Body() updateCategoryData: UpdateCategoryDto
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.updateCategory(id, updateCategoryData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    deleteCategory(
        @Param('id') id: string
    ): Promise<MongoResultQuery<CategoryDto>> {
        return this.categoryService.deleteCategory(id);
    }
}
