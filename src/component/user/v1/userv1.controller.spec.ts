import { Test, TestingModule } from '@nestjs/testing';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { UserType } from '../dto/UserType';
import { Userv1Controller } from './userv1.controller';
import { Userv1Service } from './userv1.service';

const mockUser = {
    _id: '12456',
    name: 'test user',
    username: 'test_user',
    email: 'test_user@email.com',
    password: 'pass123',
    type: UserType.ADMIN
};

const responseOne = {
    data: mockUser,
    status: OperationResult.fetch
};

const responseMany = {
    data: [mockUser],
    count: 1,
    status: OperationResult.fetch
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

describe('Userv1Controller', () => {
    let controller: Userv1Controller;
    let service: Userv1Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [Userv1Controller],
            providers: [
                {
                    provide: Userv1Service,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(responseOne),
                        findByQuery: jest.fn().mockResolvedValue(responseMany),
                        createUser: jest.fn(),
                        updateUser: jest.fn(),
                        deleteUser: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<Userv1Controller>(Userv1Controller);
        service = module.get<Userv1Service>(Userv1Service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getUsers', () => {
        it('should return users', async (done) => {
            const user = await controller.getUsers();

            expect(jest.spyOn(service, 'findByQuery')).toBeCalledTimes(1);
            expect(user.status).toBe(OperationResult.fetch);

            done();
        });
    });

    describe('getUserById', () => {
        it('should return user', async (done) => {
            const user = await controller.getUserById('12345');

            expect(jest.spyOn(service, 'findById')).toBeCalledTimes(1);
            expect(user.status).toBe(OperationResult.fetch);

            done();
        });
    });

    describe('createUser', () => {
        it('should create user', async (done) => {
            responseOne.status = OperationResult.create;
            const spy = jest
                .spyOn(service, 'createUser')
                .mockResolvedValueOnce(responseOne);

            const user = await controller.createUser(createUserDto);

            expect(spy).toBeCalledTimes(1);
            expect(user.status).toBe(OperationResult.create);

            done();
        });
    });

    describe('updateUser', () => {
        it('should update user', async (done) => {
            responseOne.status = OperationResult.update;
            const spy = jest
                .spyOn(service, 'updateUser')
                .mockResolvedValueOnce(responseOne);

            const user = await controller.updateUser('123456', updateUserDto);

            expect(spy).toBeCalledTimes(1);
            expect(user.status).toBe(OperationResult.update);

            done();
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async (done) => {
            responseOne.status = OperationResult.delete;
            const spy = jest
                .spyOn(service, 'deleteUser')
                .mockResolvedValueOnce(responseOne);
            const user = await controller.deleteUser('123456');

            expect(spy).toBeCalledTimes(1);
            expect(user.status).toBe(OperationResult.delete);

            done();
        });
    });
});
