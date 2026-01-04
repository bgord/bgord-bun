import { z } from "zod/v4";

export const EmailSubjectError = { Invalid: "email.subject.invalid" } as const;
export const EmailSubject = z
  .string(EmailSubjectError.Invalid)
  .min(1, EmailSubjectError.Invalid)
  .max(128, EmailSubjectError.Invalid);
export type EmailSubjectType = z.infer<typeof EmailSubject>;

export const EmailContentHtmlError = { Invalid: "email.content.html.invalid" } as const;
export const EmailContentHtml = z
  .string(EmailContentHtmlError.Invalid)
  .min(1, EmailContentHtmlError.Invalid)
  .max(10_000, EmailContentHtmlError.Invalid);
export type EmailContentHtmlType = z.infer<typeof EmailContentHtml>;

export type EmailAttachmentType = { filename: string; path: string };
