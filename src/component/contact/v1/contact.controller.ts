import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { MessageToAdminDto } from '../dto/contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact Us')
@Controller({
    version: '1',
    path: 'contact'
})
export class ContactController {
    constructor(private contactService: ContactService) {}

    @Post()
    async postMessage(
        @Body() messageToAdminDto: MessageToAdminDto
    ): Promise<MongoResultQuery<boolean>> {
        await this.contactService.postMessage(messageToAdminDto);
        const res = new MongoResultQuery<boolean>();

        res.data = true;
        res.status = OperationResult.complete;

        return res;
    }
}
