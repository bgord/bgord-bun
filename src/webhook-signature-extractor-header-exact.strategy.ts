import * as v from "valibot";
import type { HasRequestHeader } from "./request-context.port";
import { WebhookSignature, type WebhookSignatureType } from "./webhook-signature.vo";
import type { WebhookSignatureExtractorStrategy } from "./webhook-signature-extractor.strategy";

export class WebhookSignatureExtractorHeaderExactStrategy implements WebhookSignatureExtractorStrategy {
  constructor(private readonly header: string) {}

  extract(context: HasRequestHeader): WebhookSignatureType | null {
    const signature = v.safeParse(WebhookSignature, context.request.header(this.header));

    return signature.success ? signature.output : null;
  }
}
