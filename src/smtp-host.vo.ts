import * as v from "valibot";

export const SmtpHostError = {
  Type: "smtp.host.type",
  Empty: "smtp.host.empty",
  TooLong: "smtp.host.too.long",
};

export const SmtpHost = v.pipe(
  v.string(SmtpHostError.Type),
  v.minLength(1, SmtpHostError.Empty),
  v.maxLength(128, SmtpHostError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("SmtpHost"),
);

export type SmtpHostType = v.InferOutput<typeof SmtpHost>;
