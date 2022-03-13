import { Test, TestingModule } from '@nestjs/testing';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
    let controller: ContactController;
    let service: ContactService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactController],
            providers: [
                {
                    provide: ContactService,
                    useValue: {
                        postMessage: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<ContactController>(ContactController);
        service = module.get<ContactService>(ContactService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('postMessage', () => {
        it('send message by mail service', async (done) => {
            const mail = await controller.postMessage({
                name: 'admin',
                email: 'admin@email.com',
                message: 'test'
            });

            expect(jest.spyOn(service, 'postMessage')).toBeCalledTimes(1);
            expect(mail.status).toBe(OperationResult.complete);
            expect(mail.data).toBeTruthy();

            done();
        });
    });
});
