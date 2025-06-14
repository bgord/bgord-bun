import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";

export const RecaptchaSiteKey = z.string().trim().length(40);

export type RecaptchaSiteKeyType = z.infer<typeof RecaptchaSiteKey>;

export const RecaptchaSecretKey = z
  .string()
  .trim()
  .length(40)
  .brand("RecaptchaSecretKey");

export type RecaptchaSecretKeyType = z.infer<typeof RecaptchaSecretKey>;

export type RecaptchaVerifierConfigType = {
  secretKey: RecaptchaSecretKeyType;
};

export type RecaptchaResultType = {
  success: boolean;
  score: number;
};

export const AccessDeniedRecaptchaError = new HTTPException(403, {
  message: "access_denied_recaptcha",
});

export class RecaptchaShield {
  private readonly secretKey: RecaptchaVerifierConfigType["secretKey"];

  constructor(config: RecaptchaVerifierConfigType) {
    this.secretKey = config.secretKey;
  }

  build = createMiddleware(async (c, next) => {
    try {
      const recaptchaTokenHeader = c.req.header("x-recaptcha-token");
      const recaptchaTokenQuery = c.req.query("recaptchaToken");

      const form = await c.req.formData();
      const recaptchaTokenFormData = form
        .get("g-recaptcha-response")
        ?.toString();

      const xForwardedForHeader = c.req.header("x-forwarded-for");
      // cSpell:ignore remoteip
      const remoteip = xForwardedForHeader ?? "";

      const token =
        recaptchaTokenHeader ?? recaptchaTokenQuery ?? recaptchaTokenFormData;

      if (!token) {
        throw AccessDeniedRecaptchaError;
      }

      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token,
        remoteip,
      });

      const response = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        },
      );

      const result = (await response.json()) as RecaptchaResultType;

      if (!result.success || result.score < 0.5) {
        throw AccessDeniedRecaptchaError;
      }

      await next();
    } catch (error) {
      throw AccessDeniedRecaptchaError;
    }
  });
}
