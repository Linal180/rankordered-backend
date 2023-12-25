import { UnauthorizedException, forwardRef } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '../../user/dto/UserType';
import { AuthService } from '../auth.service';
import { AuthController } from './auth.controller';
import { ProfileModule } from 'src/component/profile/profile.module';
import { SocialProfileV1Service } from 'src/component/social-provider/v1/social-profile-v1.service';

describe.skip('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [forwardRef(() => ProfileModule)],
            controllers: [AuthController],
            providers: [
                {
                    provide: SocialProfileV1Service,
                    useValue: {}
                },
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                        verifyRefreshToken: jest.fn(),
                        getPayload: jest.fn(),
                        getByUsername: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should log in the user', async () => {
            const spy = jest.spyOn(service, 'login').mockResolvedValue({
                access_token: 'safsafsagsa',
                refresh_token: 'poipypypupo'
            });

            const response = await controller.login(
                {
                    username: 'admin',
                    password: 'admin@123'
                },
                {}
            );

            expect(spy).toBeCalledTimes(1);
            expect(response.access_token).toBe('safsafsagsa');

        });
    });

    describe('refreshToken', () => {
        it('should refresh token', async () => {
            const refreshSpy = jest
                .spyOn(service, 'verifyRefreshToken')
                .mockResolvedValue(true);

            const payloadSpy = jest
                .spyOn(service, 'getPayload')
                .mockResolvedValue({ username: 'josafjosa' });

            const usernameSpy = jest
                .spyOn(service, 'getByUsername')
                .mockResolvedValue({
                    username: 'asagasg',
                    name: 'afsafsa',
                    email: 'safsa@afasf.com',
                    password: 'safsagsg',
                    type: UserType.ADMIN,
                    favoriteItems: [],
                    token: ''
                });

            const loginSpy = jest.spyOn(service, 'login').mockResolvedValue({
                access_token: 'safsafsagsa',
                refresh_token: 'poipypypupo'
            });

            const response = await controller.refreshToken({
                refresh_token: 'safsagsagsag'
            });

            expect(refreshSpy).toBeCalledTimes(1);
            expect(payloadSpy).toBeCalledTimes(1);
            expect(usernameSpy).toBeCalledTimes(1);
            expect(loginSpy).toBeCalledTimes(1);

            expect(response).toBeTruthy();

        });

        it('should refresh token but user not found', async () => {
            const refreshSpy = jest
                .spyOn(service, 'verifyRefreshToken')
                .mockResolvedValue(true);

            const payloadSpy = jest
                .spyOn(service, 'getPayload')
                .mockResolvedValue({ username: 'josafjosa' });

            const usernameSpy = jest
                .spyOn(service, 'getByUsername')
                .mockResolvedValue(null);

            try {
                await controller.refreshToken({
                    refresh_token: 'safsagsagsag'
                });
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
            }

            expect(refreshSpy).toBeCalledTimes(1);
            expect(payloadSpy).toBeCalledTimes(1);
            expect(usernameSpy).toBeCalledTimes(1);

        });

        it('should refresh token but token invalid', async () => {
            const refreshSpy = jest
                .spyOn(service, 'verifyRefreshToken')
                .mockResolvedValue(false);

            try {
                await controller.refreshToken({
                    refresh_token: 'safsagsagsag'
                });
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
            }

            expect(refreshSpy).toBeCalledTimes(1);

        });
    });

    describe('logout', () => {
        it('should logout', async () => {
            const response = await controller.logout();

            expect(response).toBe(true);

        });
    });
});
