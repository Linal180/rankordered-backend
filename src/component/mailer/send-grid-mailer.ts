import { ConfigService } from "@nestjs/config";
import * as sgMail from '@sendgrid/mail';

export const SendGridMailer = {
  provide: 'SGMAILER',
  useFactory: async (configService: ConfigService) => {
    sgMail.setApiKey(configService.get<string>('sendGridApiKey'))

    return sgMail
  },
  inject: [ConfigService],
}
