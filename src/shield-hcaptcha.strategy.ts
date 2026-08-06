import { HCaptchaService } from "./hcaptcha.service";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { HasRequestForm, HasRequestJSON } from "./request-context.port";

export const ShieldHcaptchaStrategyError = { Rejected: "shield.hcaptcha.rejected" };

export const ShieldHcaptchaStrategyField = "h-captcha-response";

export class ShieldHcaptchaStrategy {
  private readonly hcaptcha = new HCaptchaService();

  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  async evaluate(context: HasRequestForm & HasRequestJSON): Promise<boolean> {
    try {
      const form = await context.request.form();
      const json = await context.request.json();

      const fromForm = form.get(ShieldHcaptchaStrategyField)?.toString();
      const fromJson = json[ShieldHcaptchaStrategyField];

      const token = fromForm ?? (typeof fromJson === "string" ? fromJson : undefined);

      if (!token) return false;

      const result = await this.hcaptcha.verify(this.secretKey, token);

      return result.success;
    } catch {
      return false;
    }
  }
}
