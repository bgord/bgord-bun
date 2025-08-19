import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { CaptchaShieldPort } from "./captcha.port";
import type { HCaptchaSecretKeyType } from "./captcha-hcaptcha-shield.adapter";

export const AccessDeniedHcaptchaLocalError = new HTTPException(403, {
  message: "access_denied_hcaptcha_local",
});

export class CaptchaHcaptchaLocalShield implements CaptchaShieldPort {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  build = createMiddleware(async (_c, next) => {
    try {
      const result = await hcaptcha.verify(this.secretKey, "10000000-aaaa-bbbb-cccc-000000000001");

      if (!result?.success) {
        throw AccessDeniedHcaptchaLocalError;
      }
      return next();
    } catch (_error) {
      throw AccessDeniedHcaptchaLocalError;
    }
  });
}
