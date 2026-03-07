import { HCaptchaService } from "./hcaptcha.service";
import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";

export const ShieldHcaptchaLocalStrategyError = { Rejected: "shield.hcaptcha.local.rejected" };

export const ShieldHcaptchaStrategyError = { Rejected: "shield.hcaptcha.rejected" };

export class ShieldHcaptchaStrategy {
  private readonly hcaptcha = new HCaptchaService();

  constructor(private readonly secretKey: HCaptchaSecretKeyType) {}

  async evaluate(token: string | undefined): Promise<boolean> {
    try {
      const result = await this.hcaptcha.verify(this.secretKey, token);

      return result.success;
    } catch {
      return false;
    }
  }
}
