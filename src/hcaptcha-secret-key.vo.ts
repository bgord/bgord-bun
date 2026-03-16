import * as v from "valibot";

export const HCaptchaSecretKeyError = {
  Type: "hcaptcha.secret.key.type",
  Length: "hcaptcha.secret.key.length",
};

export const HCaptchaSecretKey = v.pipe(
  v.string(HCaptchaSecretKeyError.Type),
  v.length(35, HCaptchaSecretKeyError.Length),
  // Stryker disable next-line StringLiteral
  v.brand("HCaptchaSecretKey"),
);

export type HCaptchaSecretKeyType = v.InferOutput<typeof HCaptchaSecretKey>;
