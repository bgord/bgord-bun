import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";

export const HCaptchaSecretKey = z.string().trim().length(42).brand("HCaptchaSecretKey");

export type HCaptchaSecretKeyType = z.infer<typeof HCaptchaSecretKey>;

export const HCaptchaSiteKey = z.string().trim().length(36);
export type HCaptchaSiteKeyType = z.infer<typeof HCaptchaSiteKey>;

export const HCaptchaResponseToken = z.string().trim();
export type HCaptchaResponseTokenType = z.infer<typeof HCaptchaResponseToken>;

type HCaptchaVerifierModeType = "local" | "production";

export const AccessDeniedHcaptchaError = new HTTPException(403, {
  message: "access_denied_recaptcha",
});

export type HCaptchaVerifierConfigType = {
  secretKey: HCaptchaSecretKeyType;
  mode: HCaptchaVerifierModeType;
};

export class HcaptchaShield {
  private readonly secretKey: HCaptchaSecretKeyType;
  private readonly mode: HCaptchaVerifierModeType;

  private readonly LOCAL_HCAPTCHA_RESPONSE_PLACEHOLDER = "10000000-aaaa-bbbb-cccc-000000000001";

  constructor(config: HCaptchaVerifierConfigType) {
    this.mode = config.mode;
    this.secretKey = config.secretKey;
  }

  build = createMiddleware(async (c, next) => {
    try {
      const form = await c.req.formData();

      const hcaptchaTokenFormData = form.get("h-captcha-response")?.toString() as HCaptchaResponseTokenType;

      const result = await hcaptcha.verify(
        this.secretKey,
        this.mode === "production" ? hcaptchaTokenFormData : this.LOCAL_HCAPTCHA_RESPONSE_PLACEHOLDER,
      );

      if (!result?.success) {
        throw AccessDeniedHcaptchaError;
      }
      return next();
    } catch (_error) {
      throw AccessDeniedHcaptchaError;
    }
  });
}
