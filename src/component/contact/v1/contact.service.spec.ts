import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../../../utils/mail/service/mail.service';
import { ContactService } from './contact.service';

describe('ContactService', () => {
    let service: ContactService;
    let mailService: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactService,
                {
                    provide: MailService,
                    useValue: {
                        sendMessageToAdmin: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ContactService>(ContactService);
        mailService = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('ContactService', () => {
        it('should send email using mail service', async (done) => {
            service.postMessage({
                name: '',
                email: '',
                message: ''
            });

            expect(
                jest.spyOn(mailService, 'sendMessageToAdmin')
            ).toBeCalledTimes(1);

            done();
        });

        it('should throw http error if mail service fail', async (done) => {
            const spy = jest
                .spyOn(mailService, 'sendMessageToAdmin')
                .mockRejectedValue(null);

            try {
                await service.postMessage({
                    name: '',
                    email: '',
                    message: ''
                });
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
            }

            expect(spy).toBeCalledTimes(1);

            done();
        });
    });
});
