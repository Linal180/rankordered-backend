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

const mockUser = {
    _id: '12456',
    name: 'test user',
    username: 'test_user',
    email: 'test_user@email.com',
    password: 'pass123',
    type: UserType.ADMIN
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

describe('Userv1Service', () => {
    let service: Userv1Service;
    let userModel: Model<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Userv1Service,
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
        it('should return user when findById', async (done) => {
            const spy = jest.spyOn(userModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockUser)
            } as any);

            const user = await service.findById(mockUser._id);
            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBe(mockUser.name);
            done();
        });

        it('should throw error when not found', async (done) => {
            const spy = jest.spyOn(userModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null)
            } as any);

            try {
                await service.findById('098765');
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
            done();
        });
    });

    describe('find', () => {
        it('should return user when find', async (done) => {
            const spy = jest.spyOn(userModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([mockUser])
            } as any);

            const users = await service.findByQuery();
            expect(spy).toBeCalledTimes(1);
            expect(users.data.length).toBe(1);
            done();
        });

        it('should return empty data when not found', async (done) => {
            const spy = jest.spyOn(userModel, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([])
            } as any);

            const users = await service.findByQuery();
            expect(spy).toBeCalledTimes(1);
            expect(users.data.length).toBe(0);
            done();
        });
    });

    describe('createUser', () => {
        it('should return created user', async (done) => {
            const user = await service.createUser(createUserDto);
            expect(jest.spyOn(userModel, 'create')).toBeCalledTimes(1);
            expect(user.data.username).toBe(createUserDto.username);
            done();
        });

        it('should return error when no user created instance', async (done) => {
            const spy = jest
                .spyOn(userModel, 'create')
                .mockResolvedValueOnce(null as never);

            try {
                await service.createUser(createUserDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('updateUser', () => {
        it('should return updated user', async (done) => {
            mockUser.name = updateUserDto.name;
            const spy = jest
                .spyOn(userModel, 'findByIdAndUpdate')
                .mockResolvedValue(mockUser);
            const user = await service.updateUser('123456', updateUserDto);

            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBe(updateUserDto.name);

            done();
        });

        it('should return updated password', async (done) => {
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

            done();
        });

        it('should throw exception when updated user not found', async (done) => {
            const spy = jest
                .spyOn(userModel, 'findByIdAndUpdate')
                .mockResolvedValueOnce(null);

            try {
                await service.updateUser('123456', updateUserDto);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
            done();
        });
    });

    describe('deleteUser', () => {
        it('should return user document after delete', async (done) => {
            const spy = jest.spyOn(userModel, 'findByIdAndDelete');
            const user = await service.deleteUser(mockUser._id);

            expect(spy).toBeCalledTimes(1);
            expect(user.data.name).toBeDefined();
            done();
        });

        it('should throw exception if no document after delete', async (done) => {
            const spy = jest
                .spyOn(userModel, 'findByIdAndDelete')
                .mockResolvedValueOnce(null);

            try {
                await service.deleteUser(mockUser._id);
            } catch (error) {
                expect(error).toBeInstanceOf(ObjectNotFoundException);
            }

            expect(spy).toBeCalledTimes(1);
            done();
        });
    });

    describe('getByUsername', () => {
        it('should return user by username', async (done) => {
            const spy = jest.spyOn(userModel, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockUser)
            } as any);

            const user = await service.getByUsername(mockUser.username);

            expect(spy).toBeCalledTimes(1);
            expect(user.name).toBeDefined();

            done();
        });
    });
});
