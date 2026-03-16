import * as v from "valibot";

export const SmtpUserError = {
  Type: "smtp.user.type",
  Empty: "smtp.user.empty",
  TooLong: "smtp.user.too.long",
};

export const SmtpUser = v.pipe(
  v.string(SmtpUserError.Type),
  v.minLength(1, SmtpUserError.Empty),
  v.maxLength(128, SmtpUserError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("SmtpUser"),
);

export type SmtpUserType = v.InferOutput<typeof SmtpUser>;
