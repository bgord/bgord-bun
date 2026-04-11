import type { WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookSignatureCreatorStrategy } from "./webhook-signature-creator.strategy";

export class WebhookSignatureCreatorNoopStrategy implements WebhookSignatureCreatorStrategy {
  constructor(private readonly signature: WebhookSignatureType) {}

  create(_body: string): WebhookSignatureType {
    return this.signature;
  }
}
