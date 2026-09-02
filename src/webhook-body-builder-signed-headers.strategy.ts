import type { HasRequestHeader, HasRequestText } from "./request-context.port";
import type { WebhookBodyBuilderStrategy } from "./webhook-body-builder.strategy";

export class WebhookBodyBuilderSignedHeadersStrategy implements WebhookBodyBuilderStrategy {
  constructor(private readonly headers: ReadonlyArray<string>) {}

  async build(context: HasRequestHeader & HasRequestText): Promise<string> {
    const headers = this.headers.map((name) => [name, context.request.header(name) ?? null]);

    return JSON.stringify([headers, await context.request.text()]);
  }
}
