import * as v from "valibot";
import type { HasRequestJson } from "./request-context.port";
import { WebhookId, type WebhookIdType } from "./webhook-id.vo";
import type { WebhookIdExtractorStrategy } from "./webhook-id-extractor.strategy";

export class WebhookIdExtractorJsonFieldStrategy implements WebhookIdExtractorStrategy {
  constructor(private readonly field: string) {}

  async extract(context: HasRequestJson): Promise<WebhookIdType | null> {
    const body = await context.request.json();

    const id = v.safeParse(WebhookId, body[this.field]);

    return id.success ? id.output : null;
  }
}
