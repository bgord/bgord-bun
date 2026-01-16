import * as z from "zod/v4";

export const MailerSubjectError = { Invalid: "mailer.subject.invalid" };

export const MailerSubject = z
  .string(MailerSubjectError.Invalid)
  .min(1, MailerSubjectError.Invalid)
  .max(128, MailerSubjectError.Invalid);

export type MailerSubjectType = z.infer<typeof MailerSubject>;
