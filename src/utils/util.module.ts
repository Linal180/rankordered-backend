import { Module } from '@nestjs/common';
import { EloRatingModule } from './eloRating/EloRating.module';
import { MailModule } from './mail/mail.module';

@Module({
    imports: [MailModule, EloRatingModule]
})
export class UtilModule { }
