import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { UserType } from '../dto/UserType';
import { User } from '../schemas/user.schema';
import { Userv1Service } from './userv1.service';
import { SocialProfileV1Service } from 'src/component/social-provider/v1/social-profile-v1.service';
import { forwardRef } from '@nestjs/common';
import { ProfileModule } from 'src/component/profile/profile.module';
import { SocialProfileModule } from 'src/component/social-provider/SocialProfile.module';

const mockUser = {
    _id: '12456',
    name: 'test user',
    username: 'test_user',
    email: 'test_user@email.com',
    password: 'pass123',
    type: UserType.ADMIN,
    favoriteItems: [],
    token: '',
};

const createUserDto: CreateUserDto = {
    name: 'test user',
    username: 'test_user',
    email: 'test_user@email.com',
    password: 'abc123',
    type: UserType.ADMIN
};

const updateUserDto: UpdateUserDto = {
    name: 'test user 2'
};

describe.skip('Userv1Service', () => {
    let service: Userv1Service;
    let userModel: Model<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [forwardRef(() => ProfileModule), forwardRef(() => SocialProfileModule)],
            providers: [
                Userv1Service,
                {
                    provide: SocialProfileV1Service,
                    useValue: {}
                },
                {
                    provide: getModelToken(User.name),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockUser),
                        constructor: jest.fn().mockResolvedValue(mockUser),
                        find: jest.fn(),
                        findById: jest.fn(),
                        create: jest.fn().mockResolvedValue(mockUser),
                        findByIdAndUpdate: jest.fn(),
                        findByIdAndDelete: jest
                            .fn()
                            .mockResolvedValue(mockUser),
                        findOne: jest.fn(),
                        exec: jest.fn()
                    }
                }
            ]
        }).compile();

        userModel = module.get<Model<User>>(getModelToken(User.name));
        service = module.get<Userv1Service>(Userv1Service);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        it('should return user when findById', async () => {
            const spy = jest.spyOn(userModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockUser)
            } as any);

            const user = await service.findById(mockUser._id);
            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBe(mockUser.name);
        });

        it('should throw error when not found', async () => {
            const spy = jest.spyOn(userModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findById('098765');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('find', () => {
        it('should return user when find', async () => {
            const spy = jest.spyOn(userModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockUser])
            } as any);

            const users = await service.findByQuery();
            expect(spy).toBeCalledTimes(1);
            expect(users.data.length).toBe(1);
        });

        it('should return empty data when not found', async () => {
            const spy = jest.spyOn(userModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([])
            } as any);

            const users = await service.findByQuery();
            expect(spy).toBeCalledTimes(1);
            expect(users.data.length).toBe(0);
        });
    });

    describe('createUser', () => {
        it('should return created user', async () => {
            const user = await service.createUser(createUserDto);
            expect(jest.spyOn(userModel, 'create')).toBeCalledTimes(1);
            expect(user.data.username).toBe(createUserDto.username);
        });

        it('should return error when no user created instance', async () => {
            const spy = jest
                .spyOn(userModel, 'create')
                .mockResolvedValueOnce(null as never);

            try {
                await service.createUser(createUserDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }
            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('updateUser', () => {
        it('should return updated user', async () => {
            mockUser.name = updateUserDto.name;
            const spy = jest
                .spyOn(userModel, 'findByIdAndUpdate')
                .mockResolvedValue(mockUser);
            const user = await service.updateUser('123456', updateUserDto);

            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBe(updateUserDto.name);
        });

        it('should return updated password', async () => {
            updateUserDto.password = '098765';
            mockUser.password = await hash(updateUserDto.password, 10);
            const spy = jest
                .spyOn(userModel, 'findByIdAndUpdate')
                .mockResolvedValueOnce(mockUser);

            const user = await service.updateUser('123456', updateUserDto);

            expect(spy).toBeCalledTimes(1);
            await expect(
                compare(user.data.password, updateUserDto.password)
            ).toBeTruthy();
        });

        it('should throw exception when updated user not found', async () => {
            const spy = jest
                .spyOn(userModel, 'findByIdAndUpdate')
                .mockResolvedValueOnce(null);

            try {
                await service.updateUser('123456', updateUserDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('deleteUser', () => {
        it('should return user document after delete', async () => {
            const spy = jest.spyOn(userModel, 'findByIdAndDelete');
            const user = await service.deleteUser(mockUser._id);

            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBeDefined();
        });

        it('should throw exception if no document after delete', async () => {
            const spy = jest
                .spyOn(userModel, 'findByIdAndDelete')
                .mockResolvedValueOnce(null);

            try {
                await service.deleteUser(mockUser._id);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('getByUsername', () => {
        it('should return user by username', async () => {
            const spy = jest.spyOn(userModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockUser)
            } as any);

            const user = await service.getByUsername(mockUser.username);

            expect(spy).toBeCalledTimes(1);
            expect(user.name).toBeDefined();
        });
    });
});
