import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { Gallery, GalleryDocument } from '../schemas/gallery.schema';
import * as fs from 'fs';
import { FileType } from '../schemas/FiletType';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UploadedFileWithSource } from '../schemas/UploadedFile.data';
import { PaginationDto } from 'src/shared/pagination/Pagination.dto';
import { UpdateGalleryDto } from '../dto/updateGallery.dto';
import { Userv1Service } from 'src/component/user/v1/userv1.service';

@Injectable()
export class GalleryV1Service {
    constructor(
        @InjectModel(Gallery.name)
        private galleryModel: Model<GalleryDocument>,
        private config: ConfigService,
        @Inject(forwardRef(() => Userv1Service))
        private userService: Userv1Service
    ) { }

    async findById(id: string): Promise<MongoResultQuery<Gallery>> {
        const res = new MongoResultQuery<Gallery>();

        res.data = await this.galleryModel.findById(id);

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async findAll(
        pagination: PaginationDto
    ): Promise<MongoResultQuery<Gallery[]>> {
        const res = new MongoResultQuery<Gallery[]>();

        res.data = await this.galleryModel
            .find({ isProfile: false })
            .sort([['createdAt', 'asc']])
            .skip(pagination.currentPage * pagination.limit)
            .limit(pagination.limit)
            .exec();
        res.status = OperationResult.fetch;
        res.count = await this.galleryModel.find().count();

        return res;
    }

    async uploadUserProfilePicture(
        userId: string,
        file: UploadedFileWithSource
    ): Promise<MongoResultQuery<Gallery>> {
        const res = new MongoResultQuery<Gallery>();
        try {
            const { data: user } = await this.userService.findById(userId);

            if (user.profilePicture) (
                await this.delete((user.profilePicture as any)._id)
            )

            const image = await this.galleryModel.create({
                name: `${user.name}-${userId}-profile`,
                path: file.destination.substring(2, file.destination.length),
                slug: file.filename,
                type: FileType.image,
                isProfile: true
            });
            await this.userService.updateProfilePicture(userId, image)

            res.data = image
            res.status = OperationResult.upload;

            return res;
        } catch (error) {
            console.log(error)
            res.data = null
            return res
        }

    }

    async create(
        file: UploadedFileWithSource
    ): Promise<MongoResultQuery<Gallery>> {
        const res = new MongoResultQuery<Gallery>();

        res.data = await this.galleryModel.create({
            name: file.filename,
            path: file.destination.substring(2, file.destination.length),
            slug: file.filename,
            type: FileType.image,
            source: {
                author: file.author,
                title: file.title,
                url: file.url,
                license: file.license
            }
        });

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.upload;

        return res;
    }

    async delete(id: string): Promise<MongoResultQuery<Gallery>> {
        try {
            const res = new MongoResultQuery<Gallery>();

            res.data = await this.galleryModel.findByIdAndDelete(id, {
                returnDocument: 'after'
            });

            fs.unlinkSync(
                join(this.config.get('rootPath'), res.data.path, res.data.slug)
            );

            res.status = OperationResult.delete;

            return res;
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async edit(
        id: string,
        data: UpdateGalleryDto
    ): Promise<MongoResultQuery<Gallery>> {
        const res = new MongoResultQuery<Gallery>();

        res.data = await this.galleryModel.findByIdAndUpdate(
            id,
            {
                source: data
            },
            {
                returnDocument: 'after'
            }
        );
        res.status = OperationResult.update;
        return res;
    }

    async migrate(file: {
        filename: string;
        destination: string;
        author?: string;
        title?: string;
        url?: string;
        license?: string;
    }): Promise<GalleryDocument> {
        const res = await this.galleryModel.create({
            name: file.filename,
            path: file.destination,
            slug: file.filename,
            type: FileType.image,
            source: {
                author: file.author,
                title: file.title,
                url: file.url,
                license: file.license
            }
        });

        if (!res) {
            this.throwObjectNotFoundError();
        }

        return res;
    }

    private throwObjectNotFoundError(): void {
        throw new ObjectNotFoundException(Gallery.name);
    }
}
