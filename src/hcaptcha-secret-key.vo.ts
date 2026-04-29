import * as v from "valibot";

export const HcaptchaSecretKeyError = {
  Type: "hcaptcha.secret.key.type",
  InvalidFormat: "hcaptcha.secret.key.invalid.format",
} as const;

// 0x followed by 40 hex chars (standard) or ES_ followed by 32 hex chars (Enterprise)
const CHARS_WHITELIST = /^(0x[a-fA-F0-9]{40}|ES_[a-fA-F0-9]{32})$/;

export const HCaptchaSecretKey = v.pipe(
  v.string(HcaptchaSecretKeyError.Type),
  v.regex(CHARS_WHITELIST, HcaptchaSecretKeyError.InvalidFormat),
  // Stryker disable next-line StringLiteral
  v.brand("HcaptchaSecretKey"),
);

export type HCaptchaSecretKeyType = v.InferOutput<typeof HCaptchaSecretKey>;
