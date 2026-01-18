import * as z from "zod/v4";

export const MailerSubjectError = { Invalid: "mailer.subject.invalid" };

// Stryker disable all
export const MailerSubject = z
  // Stryker restore all
  .string(MailerSubjectError.Invalid)
  .min(1, MailerSubjectError.Invalid)
  .max(128, MailerSubjectError.Invalid)
  .brand("MailerSubject");

export type MailerSubjectType = z.infer<typeof MailerSubject>;
