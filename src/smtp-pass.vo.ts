import { z } from "zod/v4";

export const SmtpPassError = {
  Type: "smtp.pass.type",
  Empty: "smtp.pass.empty",
  TooLong: "smtp.pass.too.long",
};

// Stryker disable all
export const SmtpPass = z
  // Stryker restore all
  .string(SmtpPassError.Type)
  .min(1, SmtpPassError.Empty)
  .max(128, SmtpPassError.TooLong)
  .brand("SmtpPass");

export type SmtpPassType = z.infer<typeof SmtpPass>;
