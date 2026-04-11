import type { WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

export class WebhookVerifierNoopStrategy implements WebhookVerifierStrategy {
  verify(_body: string, _signature: WebhookSignatureType): boolean {
    return true;
  }
}
