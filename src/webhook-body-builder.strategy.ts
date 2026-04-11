import type { HasRequestHeader, HasRequestText } from "./request-context.port";

export interface WebhookBodyBuilderStrategy {
  build(context: HasRequestHeader & HasRequestText): Promise<string>;
}
