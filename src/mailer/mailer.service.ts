import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: 'Verify Your Email Address',
      template: 'verify-email',
      context: {
        name,
        appName: 'KiwiCare',
        verificationUrl,
        year: new Date().getFullYear(),
      },
    });
  }
}
