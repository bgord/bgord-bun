import type { HasRequestHeader } from "./request-context.port";
import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookSignatureExtractorStrategy {
  extract(context: HasRequestHeader): WebhookSignatureType | null;
}
