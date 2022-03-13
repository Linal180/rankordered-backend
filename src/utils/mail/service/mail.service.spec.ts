import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
    let service: MailService;
    let mailerService: MailerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<MailService>(MailService);
        mailerService = module.get<MailerService>(MailerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendMessageToAdmin', () => {
        it('should send email to admin', async (done) => {
            await service.sendMessageToAdmin({
                name: '',
                email: '',
                message: ''
            });

            expect(jest.spyOn(mailerService, 'sendMail')).toBeCalledTimes(1);

            done();
        });
    });
});
