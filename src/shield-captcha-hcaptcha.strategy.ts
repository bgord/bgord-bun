import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { ShieldStrategy } from "./shield.strategy";

export const AccessDeniedHcaptchaError = new HTTPException(403, { message: "access_denied_hcaptcha" });

export class ShieldCaptchaHcaptchaStrategy implements ShieldStrategy {
  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  verify = createMiddleware(async (c, next) => {
    try {
      const form = await c.req.formData();
      const hcaptchaTokenFormData = form.get("h-captcha-response")?.toString() as string;
      const result = await hcaptcha.verify(this.secretKey, hcaptchaTokenFormData);

      if (!result?.success) throw AccessDeniedHcaptchaError;
      return next();
    } catch {
      throw AccessDeniedHcaptchaError;
    }
  });
}
