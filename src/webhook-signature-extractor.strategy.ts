import type { RequestContext } from "./request-context.port";
import type { WebhookSignatureType } from "./webhook-signature.vo";

export interface WebhookSignatureExtractorStrategy {
  extract(context: RequestContext): WebhookSignatureType | null;
}
