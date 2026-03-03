import * as tools from "@bgord/tools";
import type { RecaptchaSecretKeyType } from "./recaptcha-secret-key.vo";
import type { HasRequestHeader, HasRequestQuery } from "./request-context.port";

export type ShieldRecaptchaConfig = { secretKey: RecaptchaSecretKeyType };
export type RecaptchaResult = { success: boolean; score: number };

export const ShieldRecaptchaStrategyError = { Rejected: "shield.recaptcha.rejected" };

export class ShieldRecaptchaStrategy {
  private static readonly URL = tools.UrlWithoutSlash.parse(
    "https://www.google.com/recaptcha/api/siteverify",
  );

  constructor(private readonly config: ShieldRecaptchaConfig) {}

  async evaluate(context: HasRequestHeader & HasRequestQuery, formToken: string | null): Promise<boolean> {
    try {
      const header = context.request.header("x-recaptcha-token");
      const query = context.request.query().recaptchaToken;
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

      if (!result.success || result.score < 0.5) return false;

      return true;
    } catch {
      return false;
    }
  }
}
