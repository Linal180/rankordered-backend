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
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { TransformInterceptor } from '../../../shared/response/interceptors/Transform.interceptor';
import {
    editFileName,
    imageFileFilter
} from '../../../utils/file-uploader/file-uploading.utils';
import { FileExtender } from '../../../utils/file-uploader/FileExtender';
import { GalleryDto } from '../dto/gallery.dto';
import { GalleryV1Service } from './gallery-v1.service';
import { UploadedFileWithSource } from '../schemas/UploadedFile.data';
import { PaginationDto } from 'src/shared/pagination/Pagination.dto';
import { UpdateGalleryDto } from '../dto/updateGallery.dto';
import { Roles } from 'src/component/auth/roles.decorator';
import { RolesGuard } from 'src/component/auth/roles.guard';
import { UserType } from 'src/component/user/dto/UserType';

@ApiTags('Gallery')
@Controller({ version: '1', path: 'gallery' })
@UseInterceptors(TransformInterceptor)
export class GalleryV1Controller {
    constructor(private service: GalleryV1Service) { }

    @Get()
    async getGalleryItem(
        @Query(
            new ValidationPipe({
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true
                }
            })
        )
        pagination: PaginationDto
    ): Promise<MongoResultQuery<GalleryDto[]>> {
        return this.service.findAll(pagination);
    }

    @Get(':id')
    async getGalleryItemById(
        @Param('id') id: string
    ): Promise<MongoResultQuery<GalleryDto>> {
        return this.service.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    @ApiConsumes('multipart/form-data')
    // @ApiBody({
    //     description: 'List of image. File limit will be 20MB',
    //     type: FileUploadDto
    // })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                author: { type: 'string', required: ['false'] },
                title: { type: 'string', required: ['false'] },
                url: { type: 'string', required: ['false'] },
                license: { type: 'string', required: ['false'] },
                image: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @UseInterceptors(FileExtender)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './public/upload/images',
                filename: editFileName
            }),
            fileFilter: imageFileFilter,
            limits: {
                // file limit will be 20MB
                fileSize: 1000 * 1000 * 20
            }
        })
    )
    async uploadGalleryItem(@UploadedFile() image: UploadedFileWithSource) {
        return this.service.create(image);
    }

    @Post('upload-profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                author: { type: 'string', required: ['false'] },
                title: { type: 'string', required: ['false'] },
                url: { type: 'string', required: ['false'] },
                license: { type: 'string', required: ['false'] },
                image: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './public/upload/images',
                filename: editFileName
            }),
            fileFilter: imageFileFilter,
            limits: {
                fileSize: 1000 * 1000 * 20
            }
        })
    )
    async uploadUserProfilePicture(
        @Req() request: any,
        @UploadedFile() image: UploadedFileWithSource
    ) {
        const { user } = request || {};
        return this.service.uploadUserProfilePicture(user.userId, image);
    }

    @Put(':id/source')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    async editGalleryItemByid(
        @Param('id') id: string,
        @Body() updateGalleryData: UpdateGalleryDto
    ): Promise<MongoResultQuery<GalleryDto>> {
        return this.service.edit(id, updateGalleryData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @Roles(UserType.ADMIN)
    async deleteGalleryItemById(
        @Param('id') id: string
    ): Promise<MongoResultQuery<GalleryDto>> {
        return this.service.delete(id);
    }
}
