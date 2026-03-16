import * as v from "valibot";

export const RecaptchaSecretKeyError = {
  Type: "recaptcha.secret.key.type",
  Length: "recaptcha.secret.key.length",
};

export const RecaptchaSecretKey = v.pipe(
  v.string(RecaptchaSecretKeyError.Type),
  v.length(40, RecaptchaSecretKeyError.Length),
  // Stryker disable next-line StringLiteral
  v.brand("RecaptchaSecretKey"),
);

export type RecaptchaSecretKeyType = v.InferOutput<typeof RecaptchaSecretKey>;
