import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailService } from '../../../utils/mail/service/mail.service';
import { MessageToAdminDto } from '../dto/contact.dto';

@Injectable()
export class ContactService {
    constructor(private mailService: MailService) {}
    async postMessage(messageToAdminDto: MessageToAdminDto) {
        try {
            // to be change using queue
            await this.mailService.sendMessageToAdmin(messageToAdminDto);
        } catch (err) {
            throw new HttpException(
                'Mail service failed. Please try again',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
