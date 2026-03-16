import * as v from "valibot";

export const MailerContentHtmlError = { Invalid: "mailer.content.html.invalid" };

export const MailerContentHtml = v.pipe(
  v.string(MailerContentHtmlError.Invalid),
  v.minLength(1, MailerContentHtmlError.Invalid),
  v.maxLength(10_000, MailerContentHtmlError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("MailerContentHtml"),
);

export type MailerContentHtmlType = v.InferOutput<typeof MailerContentHtml>;
export type EmailAttachmentType = { filename: string; path: string };
