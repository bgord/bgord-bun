import { z } from "zod/v4";

export const SmtpUserError = {
  Type: "smtp.user.type",
  Empty: "smtp.user.empty",
  TooLong: "smtp.user.too.long",
};

export const SmtpUser = z
  .string(SmtpUserError.Type)
  .min(1, SmtpUserError.Empty)
  .max(128, SmtpUserError.TooLong)
  .brand("SmtpUser");

export type SmtpUserType = z.infer<typeof SmtpUser>;
