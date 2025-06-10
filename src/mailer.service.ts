import nodemailer, { SendMailOptions } from "nodemailer";
import { z } from "zod/v4";

import { Path } from "./path";
import { Port } from "./port";

export const SmtpHost = z.string().trim().min(1);

export type SmtpHostType = z.infer<typeof SmtpHost>;

export const SmtpPort = Port;

export type SmtpPortType = z.infer<typeof SmtpPort>;

export const SmtpUser = z.string().trim().min(1);

export type SmtpUserType = z.infer<typeof SmtpUser>;

export const SmtpPass = z.string().trim().min(1);

export type SmtpPassType = z.infer<typeof SmtpPass>;

type MailerConfigType = {
  SMTP_HOST: SmtpHostType;
  SMTP_PORT: SmtpPortType;
  SMTP_USER: SmtpUserType;
  SMTP_PASS: SmtpPassType;
};

type MailerSendOptionsType = SendMailOptions;

export const EmailSubject = z.string().min(1).max(128);

export type EmailSubjectType = z.infer<typeof EmailSubject>;

export const EmailContentHtml = z.string().min(1).max(10_000);

export type EmailContentHtmlType = z.infer<typeof EmailContentHtml>;

export const EmailFrom = z.email();

export type EmailFromType = z.infer<typeof EmailFrom>;

export const EmailTo = z.email();

export type EmailToType = z.infer<typeof EmailTo>;

export const EmailAttachment = z.object({ filename: Path, path: Path });

export type EmailAttachmentType = z.infer<typeof EmailAttachment>;

export class Mailer {
  private readonly transport: nodemailer.Transporter;

  constructor(config: MailerConfigType) {
    this.transport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  async send(options: MailerSendOptionsType): Promise<unknown> {
    return this.transport.sendMail(options);
  }

  async verify() {
    return this.transport.verify();
  }
}
