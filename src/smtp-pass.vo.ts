import * as v from "valibot";

export const SmtpPassError = {
  Type: "smtp.pass.type",
  Empty: "smtp.pass.empty",
  TooLong: "smtp.pass.too.long",
};

export const SmtpPass = v.pipe(
  v.string(SmtpPassError.Type),
  v.minLength(1, SmtpPassError.Empty),
  v.maxLength(128, SmtpPassError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("SmtpPass"),
);

export type SmtpPassType = v.InferOutput<typeof SmtpPass>;
