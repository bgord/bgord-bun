import { z } from "zod/v4";
import { Port } from "./port.vo";

export const SmtpHost = z.string().min(1).brand("SmtpHost");
export type SmtpHostType = z.infer<typeof SmtpHost>;

export const SmtpPort = Port;
export type SmtpPortType = z.infer<typeof SmtpPort>;

export const SmtpUser = z.string().min(1).brand("SmtpUser");
export type SmtpUserType = z.infer<typeof SmtpUser>;

export const SmtpPass = z.string().min(1).brand("SmtpPass");
export type SmtpPassType = z.infer<typeof SmtpPass>;

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
