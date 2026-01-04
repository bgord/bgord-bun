import { z } from "zod/v4";

export const MailerContentHtmlError = { Invalid: "mailer.content.html.invalid" };

export const MailerContentHtml = z
  .string(MailerContentHtmlError.Invalid)
  .min(1, MailerContentHtmlError.Invalid)
  .max(10_000, MailerContentHtmlError.Invalid);
export type MailerContentHtmlType = z.infer<typeof MailerContentHtml>;

export type EmailAttachmentType = { filename: string; path: string };
