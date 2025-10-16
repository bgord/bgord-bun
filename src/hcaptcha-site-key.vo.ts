import { z } from "zod/v4";

export const HCaptchaSiteKeyError = {
  Type: "hcaptcha.site.key.type",
  Length: "hcaptcha.site.key.length",
} as const;

export const HCaptchaSiteKey = z.string(HCaptchaSiteKeyError.Type).length(36, HCaptchaSiteKeyError.Length);

export type HCaptchaSiteKeyType = z.infer<typeof HCaptchaSiteKey>;
