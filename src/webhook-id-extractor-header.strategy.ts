import * as v from "valibot";
import type { HasRequestHeader } from "./request-context.port";
import { WebhookId, type WebhookIdType } from "./webhook-id.vo";
import type { WebhookIdExtractorStrategy } from "./webhook-id-extractor.strategy";

export class WebhookIdExtractorHeaderStrategy implements WebhookIdExtractorStrategy {
  constructor(private readonly header: string) {}

  async extract(context: HasRequestHeader): Promise<WebhookIdType | null> {
    const id = v.safeParse(WebhookId, context.request.header(this.header));

    return id.success ? id.output : null;
  }
}
