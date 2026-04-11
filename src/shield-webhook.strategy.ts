import type { HasRequestHeader, HasRequestText } from "./request-context.port";
import type { WebhookSignatureExtractorStrategy } from "./webhook-signature-extractor.strategy";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

export const ShieldWebhookStrategyError = { Rejected: "shield.webhook.rejected" };

export type ShieldWebhookStrategyConfig = {
  WebhookSignatureExtractor: WebhookSignatureExtractorStrategy;
  WebhookVerifier: WebhookVerifierStrategy;
};

export class ShieldWebhookStrategy {
  constructor(private readonly config: ShieldWebhookStrategyConfig) {}

  async evaluate(context: HasRequestHeader & HasRequestText): Promise<boolean> {
    const signature = this.config.WebhookSignatureExtractor.extract(context);

    if (!signature) return false;

    const body = await context.request.text();

    return this.config.WebhookVerifier.verify(body, signature);
  }
}
