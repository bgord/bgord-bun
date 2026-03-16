import * as v from "valibot";

export const RecaptchaSiteKeyError = { Type: "recaptcha.site.key.type", Length: "recaptcha.site.key.length" };

export const RecaptchaSiteKey = v.pipe(
  v.string(RecaptchaSiteKeyError.Type),
  v.length(40, RecaptchaSiteKeyError.Length),
  // Stryker disable next-line StringLiteral
  v.brand("RecaptchaSiteKey"),
);

export type RecaptchaSiteKeyType = v.InferOutput<typeof RecaptchaSiteKey>;
