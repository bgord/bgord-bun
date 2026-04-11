import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookSignatureCreatorStrategy {
  create(body: string): WebhookSignatureType;
}
