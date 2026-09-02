import { HCaptchaService } from "./hcaptcha.service";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { HasRequestForm, HasRequestJson } from "./request-context.port";

export const ShieldHcaptchaStrategyError = { Rejected: "shield.hcaptcha.rejected" };

export const ShieldHcaptchaStrategyField = "h-captcha-response";

export type ShieldHcaptchaConfig = { secretKey: HCaptchaSecretKeyType; hostname: string };

export class ShieldHcaptchaStrategy {
  private readonly hcaptcha = new HCaptchaService();

  constructor(private readonly config: ShieldHcaptchaConfig) {}

  async evaluate(context: HasRequestForm & HasRequestJson): Promise<boolean> {
    try {
      const form = await context.request.form();
      const json = await context.request.json();

      const fromForm = form.get(ShieldHcaptchaStrategyField)?.toString();
      const fromJson = json[ShieldHcaptchaStrategyField];

      const token = fromForm ?? (typeof fromJson === "string" ? fromJson : undefined);

      if (!token) return false;

      const result = await this.hcaptcha.verify(this.config.secretKey, token);

      if (!result.success) return false;
      if (result.hostname !== this.config.hostname) return false;

      return true;
    } catch {
      return false;
    }
  }
}
