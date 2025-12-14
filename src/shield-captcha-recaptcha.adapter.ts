import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { RecaptchaSecretKeyType } from "./recaptcha-secret-key.vo";
import type { ShieldPort } from "./shield.port";

export type RecaptchaVerifierConfigType = { secretKey: RecaptchaSecretKeyType };
export type RecaptchaResultType = { success: boolean; score: number };

export const AccessDeniedRecaptchaError = new HTTPException(403, { message: "access_denied_recaptcha" });

export class ShieldCaptchaRecaptchaAdapter implements ShieldPort {
  private static readonly URL = tools.UrlWithoutSlash.parse(
    "https://www.google.com/recaptcha/api/siteverify",
  );

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

      const response = await fetch(ShieldCaptchaRecaptchaAdapter.URL, {
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
