import { Module } from '@nestjs/common';
import { MailModule } from '../../utils/mail/mail.module';
import { ContactController } from './v1/contact.controller';
import { ContactService } from './v1/contact.service';

@Module({
    controllers: [ContactController],
    providers: [ContactService],
    exports: [ContactService],
    imports: [MailModule]
})
export class ContactModule {}
