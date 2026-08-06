// cspell:ignore remoteip
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { RecaptchaSecretKeyType } from "./recaptcha-secret-key.vo";
import type { HasIdentityIp, HasRequestForm, HasRequestJson } from "./request-context.port";

export type ShieldRecaptchaConfig = { secretKey: RecaptchaSecretKeyType; threshold?: number };
export type RecaptchaResult = { success: boolean; score: number };

export const ShieldRecaptchaStrategyError = { Rejected: "shield.recaptcha.rejected" };

export const ShieldRecaptchaStrategyField = "g-recaptcha-response";

export class ShieldRecaptchaStrategy {
  private static readonly URL = v.parse(
    tools.UrlWithoutSlash,
    "https://www.google.com/recaptcha/api/siteverify",
  );

  private static readonly DEFAULT_THRESHOLD = 0.5;

  constructor(private readonly config: ShieldRecaptchaConfig) {}

  async evaluate(context: HasIdentityIp & HasRequestForm & HasRequestJson): Promise<boolean> {
    const threshold = this.config.threshold ?? ShieldRecaptchaStrategy.DEFAULT_THRESHOLD;

    try {
      const form = await context.request.form();
      const json = await context.request.json();

      const fromForm = form.get(ShieldRecaptchaStrategyField)?.toString();
      const fromJson = json[ShieldRecaptchaStrategyField];

      const token = fromForm ?? (typeof fromJson === "string" ? fromJson : undefined);

      if (!token) return false;

      const remoteip = context.identity.ip();

      const params = new URLSearchParams({ secret: this.config.secretKey, response: token });

      if (remoteip) params.set("remoteip", remoteip);

      const response = await fetch(ShieldRecaptchaStrategy.URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const result: RecaptchaResult = await response.json();

      if (!result.success) return false;
      if (typeof result.score !== "number" || result.score < threshold) return false;

      return true;
    } catch {
      return false;
    }
  }
}
