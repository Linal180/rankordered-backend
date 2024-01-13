import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientResponse, MailDataRequired, MailService } from '@sendgrid/mail';
import { SendEmailForgotPasswordType } from './dto/forgot-password.dto';

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('SGMAILER')
    private readonly sendGridService: MailService
  ) { }

  /**
   * Sends email forgot password
   * @param params 
   * @returns email forgot password 
   */
  async sendResetPasswordLink({ email, fullName, token }: SendEmailForgotPasswordType): Promise<ClientResponse> {
    const portalAppBaseUrl: string = this.configService.get<string>('epNextAppBaseURL')
    const from: string = this.configService.get('fromEmail');
    const templateId: string = this.configService.get('templateId');
    const url = `${portalAppBaseUrl}/reset-password?token=${token}`;

    const message: MailDataRequired = {
      to: email,
      from,
      subject: "Rankordered | Reset Password",
      templateId,
      dynamicTemplateData: {
        fullName: fullName ?? 'Rankordered User',
        resetPasswordURL: url
      }
    };

    try {
      const [response] = await this.sendGridService.send(message);

      return response;
    } catch (error) {
      console.log("can't send email: -> sendEmailForget: " + error)
    }
  }
}
