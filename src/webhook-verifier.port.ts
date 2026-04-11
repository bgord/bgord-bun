import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookVerifierPort {
  verify(body: string, signature: WebhookSignatureType): boolean;
}
