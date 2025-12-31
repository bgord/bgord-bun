import { z } from "zod/v4";

export const RecaptchaSecretKeyError = {
  Type: "recaptcha.secret.key.type",
  Length: "recaptcha.secret.key.length",
};

// Stryker disable all
export const RecaptchaSecretKey = z
  // Stryker restore all
  .string(RecaptchaSecretKeyError.Type)
  .length(40, RecaptchaSecretKeyError.Length)
  .brand("RecaptchaSecretKey");

export type RecaptchaSecretKeyType = z.infer<typeof RecaptchaSecretKey>;
