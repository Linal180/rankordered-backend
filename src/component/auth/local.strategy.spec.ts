import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '../user/dto/UserType';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalStrategy,
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: jest.fn()
                    }
                }
            ]
        }).compile();

        strategy = module.get<LocalStrategy>(LocalStrategy);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should validate user', async (done) => {
            const spy = jest.spyOn(service, 'validateUser').mockResolvedValue({
                username: 'asagasg',
                name: 'afsafsa',
                email: 'safsa@afasf.com',
                password: 'asfsafsa',
                type: UserType.ADMIN
            });

            const response = await strategy.validate('asfsaf', 'afasfsa');

            expect(spy).toBeCalledTimes(1);
            expect(response).toBeTruthy();

            done();
        });

        it('should validate user but user not exist', async (done) => {
            const spy = jest
                .spyOn(service, 'validateUser')
                .mockResolvedValue(null);

            try {
                await strategy.validate('asfsaf', 'afasfsa');
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
            }

            expect(spy).toBeCalledTimes(1);
            done();
        });
    });
});
