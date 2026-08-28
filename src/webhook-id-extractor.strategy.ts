import type { HasRequestHeader, HasRequestJson } from "./request-context.port";
import type { WebhookIdType } from "./webhook-id.vo";

export interface WebhookIdExtractorStrategy {
  extract(context: HasRequestHeader & HasRequestJson): Promise<WebhookIdType | null>;
}
