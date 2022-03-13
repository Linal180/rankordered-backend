import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MessageToAdminDto } from '../../../component/contact/dto/contact.dto';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendMessageToAdmin(messageToAdminDto: MessageToAdminDto) {
        await this.mailerService.sendMail({
            to: 'info@rankordered.com',
            from: '"Support Team" <info@rankordered.com>', // override default from
            subject: 'Contact Message From User',
            template: './messageToAdmin', // `.hbs` extension is appended automatically
            context: {
                // ✏️ filling curly brackets with content
                name: messageToAdminDto.name,
                email: messageToAdminDto.email,
                message: messageToAdminDto.message
            }
        });
    }
}
