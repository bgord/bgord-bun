import { z } from "zod/v4";

export const RecaptchaSiteKeyError = { Type: "recaptcha.site.key.type", Length: "recaptcha.site.key.length" };

// Stryker disable all
export const RecaptchaSiteKey = z
  // Stryker restore all
  .string(RecaptchaSiteKeyError.Type)
  .length(40, RecaptchaSiteKeyError.Length)
  .brand("RecaptchaSiteKey");

export type RecaptchaSiteKeyType = z.infer<typeof RecaptchaSiteKey>;
