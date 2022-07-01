import { Test, TestingModule } from '@nestjs/testing';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { Readable } from 'stream';
import { FileType } from '../schemas/FiletType';
import { Gallery } from '../schemas/gallery.schema';
import { GalleryV1Controller } from './gallery-v1.controller';
import { GalleryV1Service } from './gallery-v1.service';

const mockGallery: Gallery = {
    name: 'test-name',
    slug: 'test-slug',
    path: 'test-path',
    type: FileType.image
};

const responseOne: MongoResultQuery<Gallery> = {
    data: mockGallery,
    status: OperationResult.fetch
};

const responseMany: MongoResultQuery<Gallery[]> = {
    data: [mockGallery],
    status: OperationResult.fetch,
    count: 1
};

describe('GalleryV1Controller', () => {
    let controller: GalleryV1Controller;
    let service: GalleryV1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: GalleryV1Service,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue(responseMany),
                        findById: jest.fn().mockResolvedValue(responseOne),
                        create: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ],
            controllers: [GalleryV1Controller]
        }).compile();

        controller = module.get<GalleryV1Controller>(GalleryV1Controller);
        service = module.get<GalleryV1Service>(GalleryV1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getGalleryItem', () => {
        it('should get all gallery item', async (done) => {
            const spy = jest.spyOn(service, 'findAll');

            const res = await controller.getGalleryItem({
                page: 1,
                limit: 10,
                currentPage: 0
            });

            expect(res.status).toBe(OperationResult.fetch);
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('getGalleryItemById', () => {
        it('should get gallery by id', async (done) => {
            const spy = jest.spyOn(service, 'findById');

            const res = await controller.getGalleryItemById('123456');

            expect(res.status).toBe(OperationResult.fetch);
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('uploadGalleryItem', () => {
        it('should saved uploaded file info to gallery', async (done) => {
            responseOne.status = OperationResult.upload;

            const spy = jest
                .spyOn(service, 'create')
                .mockResolvedValueOnce(responseOne);

            const res = await controller.uploadGalleryItem({
                fieldname: '',
                originalname: '',
                encoding: '',
                mimetype: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
                buffer: new Buffer('test')
            });

            expect(res.status).toBe(OperationResult.upload);
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('deleteGalleryItemById', () => {
        it('should delete gallery item by id', async (done) => {
            responseOne.status = OperationResult.delete;
            const spy = jest
                .spyOn(service, 'delete')
                .mockResolvedValueOnce(responseOne);

            const res = await controller.deleteGalleryItemById('123456');

            expect(res.status).toBe(OperationResult.delete);
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });
});
