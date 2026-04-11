import * as v from "valibot";
import type { WebhookSecretType } from "./webhook-secret.vo";
import { WebhookSignature, type WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookSignatureCreatorStrategy } from "./webhook-signature-creator.strategy";

export class WebhookSignatureCreatorSha256Strategy implements WebhookSignatureCreatorStrategy {
  create(body: string, secret: WebhookSecretType): WebhookSignatureType {
    const hasher = new Bun.CryptoHasher("sha256", secret);
    hasher.update(body);

    return v.parse(WebhookSignature, hasher.digest("hex"));
  }
}
