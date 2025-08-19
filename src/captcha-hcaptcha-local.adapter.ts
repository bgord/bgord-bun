import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { CaptchaShieldPort } from "./captcha.port";
import type { HCaptchaSecretKeyType } from "./captcha-hcaptcha-shield.adapter";
import { AccessDeniedHcaptchaError } from "./captcha-hcaptcha-shield.adapter";

export class CaptchaHcaptchaLocalShield implements CaptchaShieldPort {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  build = createMiddleware(async (_c, next) => {
    try {
      const result = await hcaptcha.verify(this.secretKey, "10000000-aaaa-bbbb-cccc-000000000001");

      if (!result?.success) {
        throw AccessDeniedHcaptchaError;
      }
      return next();
    } catch (_error) {
      throw AccessDeniedHcaptchaError;
    }
  });
}
