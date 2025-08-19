import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import { CaptchaShieldPort } from "./captcha.port";

export const HCaptchaSecretKey = z.string().trim().length(42).brand("HCaptchaSecretKey");

export type HCaptchaSecretKeyType = z.infer<typeof HCaptchaSecretKey>;

export const HCaptchaSiteKey = z.string().trim().length(36);
export type HCaptchaSiteKeyType = z.infer<typeof HCaptchaSiteKey>;

export const HCaptchaResponseToken = z.string().trim();
export type HCaptchaResponseTokenType = z.infer<typeof HCaptchaResponseToken>;

export const AccessDeniedHcaptchaError = new HTTPException(403, {
  message: "access_denied_recaptcha",
});

export class CaptchaHcaptchaShield implements CaptchaShieldPort {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  build = createMiddleware(async (c, next) => {
    try {
      const form = await c.req.formData();

      const hcaptchaTokenFormData = form.get("h-captcha-response")?.toString() as HCaptchaResponseTokenType;

      const result = await hcaptcha.verify(this.secretKey, hcaptchaTokenFormData);

      if (!result?.success) {
        throw AccessDeniedHcaptchaError;
      }
      return next();
    } catch (_error) {
      throw AccessDeniedHcaptchaError;
    }
  });
}
