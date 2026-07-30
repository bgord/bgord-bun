import { HCaptchaService } from "./hcaptcha.service";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";
import type { HasRequestForm } from "./request-context.port";

export const ShieldHcaptchaStrategyError = { Rejected: "shield.hcaptcha.rejected" };

export const ShieldHcaptchaStrategyField = "h-captcha-response";

export class ShieldHcaptchaStrategy {
  private readonly hcaptcha = new HCaptchaService();

  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  async evaluate(context: HasRequestForm): Promise<boolean> {
    try {
      const form = await context.request.form();
      const token = form.get(ShieldHcaptchaStrategyField)?.toString();

      const result = await this.hcaptcha.verify(this.secretKey, token);

      return result.success;
    } catch {
      return false;
    }
  }
}
