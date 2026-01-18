import * as z from "zod/v4";

export const MailerContentHtmlError = { Invalid: "mailer.content.html.invalid" };

// Stryker disable all
export const MailerContentHtml = z
  // Stryker restore all
  .string(MailerContentHtmlError.Invalid)
  .min(1, MailerContentHtmlError.Invalid)
  .max(10_000, MailerContentHtmlError.Invalid)
  .brand("MailerContentHtml");
export type MailerContentHtmlType = z.infer<typeof MailerContentHtml>;

export type EmailAttachmentType = { filename: string; path: string };
