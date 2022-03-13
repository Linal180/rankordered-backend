import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { UserType } from '../user/dto/UserType';
import { Userv1Service } from '../user/v1/userv1.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let userService: Userv1Service;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: Userv1Service,
                    useValue: {
                        getByUsername: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        decode: jest.fn(),
                        verifyAsync: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<Userv1Service>(Userv1Service);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should validate user', async (done) => {
            const password = await hash('pass123', 10);

            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce({
                    username: 'asagasg',
                    name: 'afsafsa',
                    email: 'safsa@afasf.com',
                    password: password,
                    type: UserType.ADMIN
                });

            const response = await service.validateUser('asagasg', 'pass123');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeTruthy();

            done();
        });

        it('should validate user but password not match', async (done) => {
            const password = await hash('pass123', 10);

            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce({
                    username: 'asagasg',
                    name: 'afsafsa',
                    email: 'safsa@afasf.com',
                    password: password,
                    type: UserType.ADMIN
                });

            const response = await service.validateUser('asagasg', 'pass1234');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeFalsy();

            done();
        });

        it('should validate user but user not exist', async (done) => {
            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce(null);

            const response = await service.validateUser('asagasg', 'pass123');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeFalsy();

            done();
        });
    });

    describe('login', () => {
        it('should login user', async (done) => {
            const spy = jest.spyOn(jwtService, 'sign');

            await service.login({
                username: 'asfsafa',
                _id: 'asagsa'
            });

            expect(spy).toBeCalled();

            done();
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify refresh token', async (done) => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockResolvedValueOnce({ exp: new Date() });

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeTruthy();
            expect(spy).toBeCalledTimes(1);

            done();
        });

        it('should verify refresh token', async (done) => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockResolvedValueOnce({
                    exp: Date.parse('01 Jan 1970 00:00:00 GMT')
                });

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeFalsy();
            expect(spy).toBeCalledTimes(1);

            done();
        });

        it('should verify refresh token but throw error', async (done) => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockRejectedValueOnce(null);

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeFalsy();
            expect(spy).toBeCalledTimes(1);

            done();
        });
    });

    describe('getByUsername', () => {
        it('should get by username', async (done) => {
            await service.getByUsername('safsafasf');

            expect(jest.spyOn(userService, 'getByUsername')).toBeCalled();

            done();
        });
    });

    describe('getPayload', () => {
        it('should get payload from token', async (done) => {
            await service.getPayload('asfsafsafas');

            expect(jest.spyOn(jwtService, 'decode')).toBeCalled();

            done();
        });
    });
});
