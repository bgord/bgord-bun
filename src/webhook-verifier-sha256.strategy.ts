import { timingSafeEqual } from "node:crypto";
import type { WebhookSecretType } from "./webhook-secret.vo";
import type { WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookSignatureCreatorStrategy } from "./webhook-signature-creator.strategy";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

type Config = { secret: WebhookSecretType; WebhookSignatureCreator: WebhookSignatureCreatorStrategy };

export class WebhookVerifierSha256Strategy implements WebhookVerifierStrategy {
  constructor(private readonly config: Config) {}

  verify(body: string, signature: WebhookSignatureType): boolean {
    const digest = this.config.WebhookSignatureCreator.create(body, this.config.secret);

    if (digest.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
