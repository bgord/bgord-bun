import nodemailer, { SendMailOptions } from "nodemailer";
import { z } from "zod/v4";

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
