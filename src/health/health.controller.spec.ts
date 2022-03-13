import { ConfigService } from '@nestjs/config';
import {
    HealthCheckService,
    HttpHealthIndicator,
    MongooseHealthIndicator
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;
    let healthCheckService: HealthCheckService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthCheckService,
                    useValue: {
                        check: jest.fn()
                    }
                },
                {
                    provide: HttpHealthIndicator,
                    useValue: {
                        pingCheck: jest.fn()
                    }
                },
                { provide: ConfigService, useValue: {} },
                {
                    provide: MongooseHealthIndicator,
                    useValue: {
                        pingCheck: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<HealthController>(HealthController);
        healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('check', () => {
        it.skip('should return health info', async (done) => {
            const spy = jest.spyOn(healthCheckService, 'check');

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });
});
