import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookVerifierStrategy {
  verify(body: string, signature: WebhookSignatureType): boolean;
}
