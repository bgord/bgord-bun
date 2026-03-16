import * as v from "valibot";

export const HCaptchaSiteKeyError = { Type: "hcaptcha.site.key.type", Length: "hcaptcha.site.key.length" };

export const HCaptchaSiteKey = v.pipe(
  v.string(HCaptchaSiteKeyError.Type),
  v.length(36, HCaptchaSiteKeyError.Length),
  // Stryker disable next-line StringLiteral
  v.brand("HCaptchaSiteKey"),
);

export type HCaptchaSiteKeyType = v.InferOutput<typeof HCaptchaSiteKey>;
