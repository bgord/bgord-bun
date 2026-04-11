import type { HasRequestHeader, HasRequestText } from "./request-context.port";
import type { WebhookBodyBuilderStrategy } from "./webhook-body-builder.strategy";

export class WebhookBodyBuilderTextStrategy implements WebhookBodyBuilderStrategy {
  async build(context: HasRequestHeader & HasRequestText): Promise<string> {
    return context.request.text();
  }
}
