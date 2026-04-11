import { timingSafeEqual } from "node:crypto";
import type { WebhookSecretType } from "./webhook-secret.vo";
import type { WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookVerifierStrategy } from "./webhook-verifier.port";

export class WebhookVerifierSha256Strategy implements WebhookVerifierStrategy {
  constructor(private readonly secret: WebhookSecretType) {}

  verify(body: string, signature: WebhookSignatureType): boolean {
    const hasher = new Bun.CryptoHasher("sha256", this.secret);
    hasher.update(body);
    const digest = hasher.digest("hex");

    if (digest.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
