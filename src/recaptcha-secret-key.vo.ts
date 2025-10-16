import { z } from "zod/v4";

export const RecaptchaSecretKeyError = {
  Type: "recaptcha.secret.key.type",
  Length: "recaptcha.secret.key.length",
} as const;

export const RecaptchaSecretKey = z
  .string(RecaptchaSecretKeyError.Type)
  .length(40, RecaptchaSecretKeyError.Length)
  .brand("RecaptchaSecretKey");

export type RecaptchaSecretKeyType = z.infer<typeof RecaptchaSecretKey>;
