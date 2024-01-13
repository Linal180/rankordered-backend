import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { CreateCategoryDto } from '../dto/CreateCategory.dto';
import { UpdateCategoryDto } from '../dto/UpdateCategory.dto';
import { CategoryDocument, Category } from '../schemas/category.schema';
import { generateSlug } from 'src/utils/social-media-helpers/social-media.utils';

@Injectable()
export class CategoryV1Service {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>
    ) { }

    async findById(
        id: string,
        includeRankingItems?: boolean
    ): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();
        const modelBuilder = this.categoryModel.findById(id);

        if (includeRankingItems === true) {
            modelBuilder.select('categoryRankingItems');
        }

        res.data = await modelBuilder.exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;
        return res;
    }

    async findBySlug(slug: string): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();
        res.data = await this.categoryModel.findOne({ slug: slug }).exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;
        return res;
    }

    async findByQuery(filter: any = {}): Promise<MongoResultQuery<Category[]>> {
        const res = new MongoResultQuery<Category[]>();

        res.data = await this.categoryModel.find(filter).exec();

        res.count = res.data.length;
        res.status = OperationResult.fetch;
        return res;
    }

    async createCategory(
        category: CreateCategoryDto
    ): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();

        res.data = await this.categoryModel.create(category);

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.create;

        return res;
    }

    async findOrCreateCategory(
        name: string
    ): Promise<Category | null> {
        const categories = await this.categoryModel.find({ name }).exec();

        if (categories.length) {
            return categories[0];
        }

        const newCategory = await this.categoryModel.create({
            name, slug: generateSlug(name),
            isSocial: true
        })

        return newCategory;
    }

    async toggleActiveCategory(
        id: string,
        active: boolean
    ): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();
        res.data = await this.categoryModel.findByIdAndUpdate(
            id,
            { active: active },
            { returnDocument: 'after' }
        );

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.update;
        return res;
    }

    async updateCategory(
        id: string,
        category: UpdateCategoryDto
    ): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();
        res.data = await this.categoryModel.findByIdAndUpdate(id, category, {
            returnDocument: 'after'
        });

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.update;

        return res;
    }

    async deleteCategory(id: string): Promise<MongoResultQuery<Category>> {
        const res = new MongoResultQuery<Category>();
        res.data = await this.categoryModel.findByIdAndDelete(id);

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.delete;

        return res;
    }

    private throwObjectNotFoundError() {
        throw new ObjectNotFoundException(Category.name);
    }
}
