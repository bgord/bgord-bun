import { z } from "zod/v4";

export const HCaptchaSecretKeyError = {
  Type: "hcaptcha.secret.key.type",
  Length: "hcaptcha.secret.key.length",
} as const;

export const HCaptchaSecretKey = z
  .string(HCaptchaSecretKeyError.Type)
  .length(42, HCaptchaSecretKeyError.Length)
  .brand("HCaptchaSecretKey");

export type HCaptchaSecretKeyType = z.infer<typeof HCaptchaSecretKey>;
