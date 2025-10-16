import hcaptcha from "hcaptcha";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type { ShieldCaptchaPort } from "./shield-captcha.port";

export const HCaptchaSecretKey = z.string().length(42).brand("HCaptchaSecretKey");
export type HCaptchaSecretKeyType = z.infer<typeof HCaptchaSecretKey>;

export const AccessDeniedHcaptchaError = new HTTPException(403, { message: "access_denied_hcaptcha" });

export class ShieldCaptchaHcaptchaAdapter implements ShieldCaptchaPort {
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
