import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type { ShieldCaptchaPort } from "./shield-captcha.port";

export const RecaptchaSiteKey = z.string().trim().length(40);
export type RecaptchaSiteKeyType = z.infer<typeof RecaptchaSiteKey>;

export const RecaptchaSecretKey = z.string().trim().length(40).brand("RecaptchaSecretKey");
export type RecaptchaSecretKeyType = z.infer<typeof RecaptchaSecretKey>;

export type RecaptchaVerifierConfigType = { secretKey: RecaptchaSecretKeyType };
export type RecaptchaResultType = { success: boolean; score: number };

export const AccessDeniedRecaptchaError = new HTTPException(403, { message: "access_denied_recaptcha" });

export class ShieldCaptchaRecaptcha implements ShieldCaptchaPort {
  constructor(private readonly config: RecaptchaVerifierConfigType) {}

  verify = createMiddleware(async (c, next) => {
    try {
      const recaptchaTokenHeader = c.req.header("x-recaptcha-token");
      const recaptchaTokenQuery = c.req.query("recaptchaToken");
      const recaptchaTokenFormData = (await c.req.formData()).get("g-recaptcha-response")?.toString();

      // cSpell:ignore remoteip
      const remoteip = c.req.header("x-forwarded-for") ?? "";

      const token = recaptchaTokenHeader ?? recaptchaTokenQuery ?? recaptchaTokenFormData;

      if (!token) throw AccessDeniedRecaptchaError;

      const params = new URLSearchParams({ secret: this.config.secretKey, response: token, remoteip });

      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const result: RecaptchaResultType = await response.json();

      if (!result.success || result.score < 0.5) throw AccessDeniedRecaptchaError;

      await next();
    } catch {
      throw AccessDeniedRecaptchaError;
    }
  });
}
