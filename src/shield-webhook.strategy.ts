import type { HashContentStrategy } from "./hash-content.strategy";
import type { IdempotencyStorePort } from "./idempotency-store.port";
import type { HasRequestHeader, HasRequestJson, HasRequestText } from "./request-context.port";
import type { WebhookBodyBuilderStrategy } from "./webhook-body-builder.strategy";
import type { WebhookIdExtractorStrategy } from "./webhook-id-extractor.strategy";
import type { WebhookSignatureExtractorStrategy } from "./webhook-signature-extractor.strategy";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

export const ShieldWebhookStrategyError = { Rejected: "shield.webhook.rejected" };

export type ShieldWebhookStrategyConfig = {
  WebhookBodyBuilder: WebhookBodyBuilderStrategy;
  WebhookIdExtractor: WebhookIdExtractorStrategy;
  WebhookSignatureExtractor: WebhookSignatureExtractorStrategy;
  WebhookVerifier: WebhookVerifierStrategy;
};

export type ShieldWebhookStrategyDependencies = {
  HashContent: HashContentStrategy;
  IdempotencyStore: IdempotencyStorePort;
};

export class ShieldWebhookStrategy {
  constructor(
    private readonly config: ShieldWebhookStrategyConfig,
    private readonly deps: ShieldWebhookStrategyDependencies,
  ) {}

  async evaluate(context: HasRequestHeader & HasRequestJson & HasRequestText): Promise<boolean> {
    const signature = this.config.WebhookSignatureExtractor.extract(context);

    if (!signature) return false;

    const body = await this.config.WebhookBodyBuilder.build(context);

    if (!this.config.WebhookVerifier.verify(body, signature)) return false;

    const id = await this.config.WebhookIdExtractor.extract(context);

    if (!id) return false;

    return this.deps.IdempotencyStore.claim(await this.deps.HashContent.hash(id));
  }
}
