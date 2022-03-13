import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRoot({
            // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
            // or
            transport: {
                host: 'mail.rankordered.com',
                secure: true,
                auth: {
                    user: 'info@rankordered.com',
                    pass: '5ryb3PT2$8[gn^'
                }
            },
            defaults: {
                from: '"No Reply" <noreply@example.com>'
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true
                }
            }
        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
