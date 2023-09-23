import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendGridMailer } from './send-grid-mailer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailerService, SendGridMailer],
  exports: [MailerService, SendGridMailer]
})

export class MailerModule { }
