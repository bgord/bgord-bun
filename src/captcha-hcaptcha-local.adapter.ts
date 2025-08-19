import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { CaptchaShieldPort } from "./captcha-shield.port";
import type { HCaptchaSecretKeyType } from "./hcaptcha-shield.adapter";
import { AccessDeniedHcaptchaError } from "./hcaptcha-shield.adapter";

export type CaptchaHcaptchaLocalConfigType = { secretKey: HCaptchaSecretKeyType };

export class CaptchaHcaptchaLocalShield implements CaptchaShieldPort {
  private readonly secretKey: HCaptchaSecretKeyType;

  constructor(config: CaptchaHcaptchaLocalConfigType) {
    this.secretKey = config.secretKey;
  }

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
