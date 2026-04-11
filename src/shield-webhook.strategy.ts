import type { RequestContext } from "./request-context.port";
import type { WebhookBodyBuilderStrategy } from "./webhook-body-builder.strategy";
import type { WebhookSignatureExtractorStrategy } from "./webhook-signature-extractor.strategy";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

export const ShieldWebhookStrategyError = { Rejected: "shield.webhook.rejected" };

export type ShieldWebhookStrategyConfig = {
  WebhookBodyBuilder: WebhookBodyBuilderStrategy;
  WebhookSignatureExtractor: WebhookSignatureExtractorStrategy;
  WebhookVerifier: WebhookVerifierStrategy;
};

export class ShieldWebhookStrategy {
  constructor(private readonly config: ShieldWebhookStrategyConfig) {}

  async evaluate(context: RequestContext): Promise<boolean> {
    const signature = this.config.WebhookSignatureExtractor.extract(context);

    if (!signature) return false;

    const body = await this.config.WebhookBodyBuilder.build(context);

    return this.config.WebhookVerifier.verify(body, signature);
  }
}
