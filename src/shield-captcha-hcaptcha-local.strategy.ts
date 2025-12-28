import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { ShieldStrategy } from "./shield.strategy";

export const AccessDeniedHcaptchaLocalError = new HTTPException(403, {
  message: "access_denied_hcaptcha_local",
});

export class ShieldCaptchaHcaptchaLocalStrategy implements ShieldStrategy {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  verify = createMiddleware(async (_c, next) => {
    try {
      const result = await hcaptcha.verify(this.secretKey, "10000000-aaaa-bbbb-cccc-000000000001");

      if (!result?.success) throw AccessDeniedHcaptchaLocalError;
      return next();
    } catch {
      throw AccessDeniedHcaptchaLocalError;
    }
  });
}
