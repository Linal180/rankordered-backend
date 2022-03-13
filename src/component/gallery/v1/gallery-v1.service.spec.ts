import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { Readable } from 'stream';
import { FileType } from '../schemas/FiletType';
import { Gallery } from '../schemas/gallery.schema';
import { GalleryV1Service } from './gallery-v1.service';

const mockGallery: Gallery = {
    name: 'test-name',
    slug: 'test-slug',
    path: 'test-path',
    type: FileType.image
};

describe('GalleryV1Service', () => {
    let service: GalleryV1Service;
    let model: Model<Gallery>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GalleryV1Service,
                {
                    provide: getModelToken(Gallery.name),
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn().mockResolvedValue(mockGallery),
                        create: jest.fn().mockResolvedValue(mockGallery),
                        exec: jest.fn(),
                        count: jest.fn(),
                        findByIdAndDelete: jest
                            .fn()
                            .mockResolvedValue(mockGallery)
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('root')
                    }
                }
            ]
        }).compile();

        service = module.get<GalleryV1Service>(GalleryV1Service);
        model = module.get<Model<Gallery>>(getModelToken(Gallery.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        it('should find by id', async (done) => {
            const spy = jest.spyOn(model, 'findById');

            const res = await service.findById('123456');

            expect(spy).toBeCalledTimes(1);
            expect(res.status).toBe(OperationResult.fetch);
            expect(res.data).toBe(mockGallery);

            done();
        });

        it('should throw error when galery not found', async (done) => {
            jest.spyOn(model, 'findById').mockResolvedValueOnce(null);

            try {
                await service.findById('123456');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            done();
        });
    });

    describe('findAll', () => {
        it('should find all galleries', async (done) => {
            const spy = jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockGallery]),
                count: jest.fn().mockResolvedValueOnce(1)
            } as never);

            const res = await service.findAll();

            expect(spy).toBeCalledTimes(2);
            expect(res.status).toBe(OperationResult.fetch);
            expect(res.count).toBe(1);

            done();
        });
    });

    describe('create', () => {
        it('should create gallery data', async (done) => {
            const spy = jest.spyOn(model, 'create');

            const res = await service.create({
                fieldname: '',
                originalname: '',
                encoding: '',
                mimetype: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
                buffer: new Buffer('lol')
            });

            expect(spy).toBeCalledTimes(1);
            expect(res.status).toBe(OperationResult.upload);

            done();
        });

        it('should throw error when create gallery data not found', async (done) => {
            const spy = jest
                .spyOn(model, 'create')
                .mockResolvedValueOnce(null as never);

            try {
                await service.create({
                    fieldname: '',
                    originalname: '',
                    encoding: '',
                    mimetype: '',
                    size: 0,
                    stream: new Readable(),
                    destination: '',
                    filename: '',
                    path: '',
                    buffer: new Buffer('lol')
                });
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('delete', () => {
        it.skip('should delete gallery item', async (done) => {
            const spy = jest.spyOn(model, 'findByIdAndDelete');

            const res = await service.delete('123456');

            expect(spy).toBeCalledTimes(1);
            expect(res.status).toBe(OperationResult.delete);

            done();
        });
    });
});
