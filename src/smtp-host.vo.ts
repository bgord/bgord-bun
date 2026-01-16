import * as z from "zod/v4";

export const SmtpHostError = {
  Type: "smtp.host.type",
  Empty: "smtp.host.empty",
  TooLong: "smtp.host.too.long",
};

// Stryker disable all
export const SmtpHost = z
  // Stryker restore all
  .string(SmtpHostError.Type)
  .min(1, SmtpHostError.Empty)
  .max(128, SmtpHostError.TooLong)
  .brand("SmtpHost");

export type SmtpHostType = z.infer<typeof SmtpHost>;
