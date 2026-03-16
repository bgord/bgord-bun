import * as v from "valibot";

export const MailerSubjectError = { Invalid: "mailer.subject.invalid" };

export const MailerSubject = v.pipe(
  v.string(MailerSubjectError.Invalid),
  v.minLength(1, MailerSubjectError.Invalid),
  v.maxLength(128, MailerSubjectError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("MailerSubject"),
);

export type MailerSubjectType = v.InferOutput<typeof MailerSubject>;
