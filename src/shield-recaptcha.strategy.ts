import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { RecaptchaSecretKeyType } from "./recaptcha-secret-key.vo";
import type { HasRequestHeader, HasRequestQuery } from "./request-context.port";

export type ShieldRecaptchaConfig = { secretKey: RecaptchaSecretKeyType; threshold?: number };
export type RecaptchaResult = { success: boolean; score: number };

export const ShieldRecaptchaStrategyError = { Rejected: "shield.recaptcha.rejected" };

export class ShieldRecaptchaStrategy {
  private static readonly URL = v.parse(
    tools.UrlWithoutSlash,
    "https://www.google.com/recaptcha/api/siteverify",
  );

  private static readonly DEFAULT_THRESHOLD = 0.5;

  constructor(private readonly config: ShieldRecaptchaConfig) {}

  async evaluate(context: HasRequestHeader & HasRequestQuery, formToken: string | null): Promise<boolean> {
    const threshold = this.config.threshold ?? ShieldRecaptchaStrategy.DEFAULT_THRESHOLD;

    try {
      const header = context.request.header("x-recaptcha-token");
      const query = context.request.query()["recaptchaToken"];
      const remoteip = context.request.header("x-forwarded-for") ?? "";

      const token = header ?? query ?? formToken;

      if (!token) return false;

      const params = new URLSearchParams({ secret: this.config.secretKey, response: token, remoteip });

      const response = await fetch(ShieldRecaptchaStrategy.URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const result: RecaptchaResult = await response.json();

      if (!result.success || result.score < threshold) return false;
      return true;
    } catch {
      return false;
    }
  }
}
