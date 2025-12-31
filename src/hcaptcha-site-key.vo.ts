import { z } from "zod/v4";

export const HCaptchaSiteKeyError = { Type: "hcaptcha.site.key.type", Length: "hcaptcha.site.key.length" };

// Stryker disable all
export const HCaptchaSiteKey = z
  // Stryker restore all
  .string(HCaptchaSiteKeyError.Type)
  .length(36, HCaptchaSiteKeyError.Length)
  .brand("HCaptchaSiteKey");

export type HCaptchaSiteKeyType = z.infer<typeof HCaptchaSiteKey>;
