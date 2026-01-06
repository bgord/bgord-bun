import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { ShieldStrategy } from "./shield.strategy";

export const ShieldHcaptchaLocalError = new HTTPException(403, { message: "shield.hcaptcha.local" });

export class ShieldHcaptchaLocalStrategy implements ShieldStrategy {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  verify = createMiddleware(async (_c, next) => {
    try {
      const result = await hcaptcha.verify(this.secretKey, "10000000-aaaa-bbbb-cccc-000000000001");

      if (!result.success) throw ShieldHcaptchaLocalError;
      return next();
    } catch {
      throw ShieldHcaptchaLocalError;
    }
  });
}
