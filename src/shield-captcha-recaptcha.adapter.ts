import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import type { ShieldCaptchaPort } from "./shield-captcha.port";

export const RecaptchaSiteKey = z.string().length(40);
export type RecaptchaSiteKeyType = z.infer<typeof RecaptchaSiteKey>;

export const RecaptchaSecretKey = z.string().length(40).brand("RecaptchaSecretKey");
export type RecaptchaSecretKeyType = z.infer<typeof RecaptchaSecretKey>;

export type RecaptchaVerifierConfigType = { secretKey: RecaptchaSecretKeyType };
export type RecaptchaResultType = { success: boolean; score: number };

export const AccessDeniedRecaptchaError = new HTTPException(403, { message: "access_denied_recaptcha" });

export class ShieldCaptchaRecaptchaAdapter implements ShieldCaptchaPort {
  constructor(private readonly config: RecaptchaVerifierConfigType) {}

  verify = createMiddleware(async (c, next) => {
    try {
      const header = c.req.header("x-recaptcha-token");
      const query = c.req.query("recaptchaToken");
      const form = (await c.req.formData()).get("g-recaptcha-response")?.toString();

      const token = header ?? query ?? form;

      if (!token) throw AccessDeniedRecaptchaError;

      // cSpell:ignore remoteip
      const remoteip = c.req.header("x-forwarded-for") ?? "";

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
