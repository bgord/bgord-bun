import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { RecaptchaSecretKeyType } from "./recaptcha-secret-key.vo";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import type { ShieldStrategy } from "./shield.strategy";

export type RecaptchaVerifierConfigType = { secretKey: RecaptchaSecretKeyType };
export type RecaptchaResultType = { success: boolean; score: number };

export const ShieldRecaptchaError = new HTTPException(403, { message: "shield.recaptcha" });

export class ShieldRecaptchaStrategy implements ShieldStrategy {
  private static readonly URL = tools.UrlWithoutSlash.parse(
    "https://www.google.com/recaptcha/api/siteverify",
  );

  constructor(private readonly config: RecaptchaVerifierConfigType) {}

  verify = createMiddleware(async (c, next) => {
    try {
      const context = new RequestContextAdapterHono(c);

      const header = context.request.header("x-recaptcha-token");
      const query = context.request.query().recaptchaToken;
      const form = (await c.req.formData()).get("g-recaptcha-response")?.toString();
      const remoteip = context.request.header("x-forwarded-for") ?? "";

      const token = header ?? query ?? form;

      if (!token) throw ShieldRecaptchaError;

      const params = new URLSearchParams({ secret: this.config.secretKey, response: token, remoteip });

      const response = await fetch(ShieldRecaptchaStrategy.URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const result: RecaptchaResultType = await response.json();

      if (!result.success || result.score < 0.5) throw ShieldRecaptchaError;

      await next();
    } catch {
      throw ShieldRecaptchaError;
    }
  });
}
