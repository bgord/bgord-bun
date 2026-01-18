import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { HCaptchaService } from "./hcaptcha.service";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { ShieldStrategy } from "./shield.strategy";

export const ShieldHcaptchaError = new HTTPException(403, { message: "shield.hcaptcha" });

export class ShieldHcaptchaStrategy implements ShieldStrategy {
  private readonly hcaptcha = new HCaptchaService();

  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  verify = createMiddleware(async (context, next) => {
    try {
      const form = await context.req.formData();
      const hcaptchaTokenFormData = form.get("h-captcha-response")?.toString() as string;
      const result = await this.hcaptcha.verify(this.secretKey, hcaptchaTokenFormData);

      if (!result.success) throw ShieldHcaptchaError;
      return next();
    } catch {
      throw ShieldHcaptchaError;
    }
  });
}
