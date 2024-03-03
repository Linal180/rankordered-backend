import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { UserType } from '../../user/dto/UserType';
import { Userv1Service } from '../../user/v1/userv1.service';
import { AuthService } from './auth.service';
import { ProfileModule } from '../../profile/profile.module';
import { SocialProfileV1Service } from '../../social-provider/v1/social-profile-v1.service';
import { MailService } from 'src/utils/mail/service/mail.service';
import { MailerModule } from '../../mailer/mailer.module';
import { SocialProfileModule } from '../../social-provider/SocialProfile.module';

describe.skip('AuthService', () => {
    let service: AuthService;
    let userService: Userv1Service;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ProfileModule, MailerModule, SocialProfileModule],
            providers: [
                AuthService,
                {
                    provide: Userv1Service,
                    useValue: {
                        getByUsername: jest.fn()
                    }
                },
                {
                    provide: MailService,
                    useValue: {}
                },
                {
                    provide: SocialProfileV1Service,
                    useValue: {}
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
        it('should validate user', async () => {
            const password = await hash('pass123', 10);

            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce({
                    username: 'asagasg',
                    name: 'afsafsa',
                    email: 'safsa@afasf.com',
                    password: password,
                    type: UserType.ADMIN,
                    favoriteItems: [],
                    token: ''
                });

            const response = await service.validateUser('asagasg', 'pass123');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeTruthy();

        });

        it('should validate user but password not match', async () => {
            const password = await hash('pass123', 10);

            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce({
                    username: 'asagasg',
                    name: 'afsafsa',
                    email: 'safsa@afasf.com',
                    password: password,
                    type: UserType.ADMIN,
                    favoriteItems: [],
                    token: ''
                });

            const response = await service.validateUser('asagasg', 'pass1234');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeFalsy();

        });

        it('should validate user but user not exist', async () => {
            const spy = jest
                .spyOn(userService, 'getByUsername')
                .mockResolvedValueOnce(null);

            const response = await service.validateUser('asagasg', 'pass123');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeFalsy();

        });
    });

    describe('login', () => {
        it('should login user', async () => {
            const spy = jest.spyOn(jwtService, 'sign');

            await service.login({
                username: 'asfsafa',
                _id: 'asagsa'
            });

            expect(spy).toBeCalled();

        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify refresh token', async () => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockResolvedValueOnce({ exp: new Date() });

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeTruthy();
            expect(spy).toBeCalledTimes(1);

        });

        it('should verify refresh token', async () => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockResolvedValueOnce({
                    exp: Date.parse('01 Jan 1970 00:00:00 GMT')
                });

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeFalsy();
            expect(spy).toBeCalledTimes(1);

        });

        it('should verify refresh token but throw error', async () => {
            const spy = jest
                .spyOn(jwtService, 'verifyAsync')
                .mockRejectedValueOnce(null);

            const response = await service.verifyRefreshToken('asfasfsaf');

            expect(response).toBeFalsy();
            expect(spy).toBeCalledTimes(1);

        });
    });

    describe('getByUsername', () => {
        it('should get by username', async () => {
            await service.getByUsername('safsafasf');

            expect(jest.spyOn(userService, 'getByUsername')).toBeCalled();

        });
    });

    describe('getPayload', () => {
        it('should get payload from token', async () => {
            await service.getPayload('asfsafsafas');

            expect(jest.spyOn(jwtService, 'decode')).toBeCalled();

        });
    });
});
