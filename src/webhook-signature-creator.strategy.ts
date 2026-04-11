import type { WebhookSecretType } from "./webhook-secret.vo";
import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookSignatureCreatorStrategy {
  create(body: string, secret: WebhookSecretType): WebhookSignatureType;
}
