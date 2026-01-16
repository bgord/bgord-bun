import * as z from "zod/v4";

export const HCaptchaSecretKeyError = {
  Type: "hcaptcha.secret.key.type",
  Length: "hcaptcha.secret.key.length",
};

// Stryker disable all
export const HCaptchaSecretKey = z
  // Stryker restore all
  .string(HCaptchaSecretKeyError.Type)
  .length(35, HCaptchaSecretKeyError.Length)
  .brand("HCaptchaSecretKey");

export type HCaptchaSecretKeyType = z.infer<typeof HCaptchaSecretKey>;
