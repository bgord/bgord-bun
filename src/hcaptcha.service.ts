import type { HCaptchaSecretKeyType } from "./hcaptcha-secret-key.vo";

export const HCaptchaServiceError = { Error: "hcaptcha.service.error" };

type HcaptchaTokenType = string;

export type HCaptchaVerificationResult = { success: boolean; hostname?: string };

export class HCaptchaService {
  async verify(
    secretKey: HCaptchaSecretKeyType,
    token: HcaptchaTokenType,
  ): Promise<HCaptchaVerificationResult> {
    const body = new URLSearchParams({ secret: secretKey, response: token });

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) throw new Error(HCaptchaServiceError.Error);

    return response.json();
  }
}
