import * as v from "valibot";
import type { HasRequestHeader, HasRequestText } from "./request-context.port";
import { WebhookSignature } from "./webhook-signature.vo";
import type { WebhookVerifierStrategy } from "./webhook-verifier.strategy";

export const ShieldWebhookStrategyError = { Rejected: "shield.webhook.rejected" };

export type ShieldWebhookStrategyConfig = { header: string; WebhookVerifier: WebhookVerifierStrategy };

export class ShieldWebhookStrategy {
  constructor(private readonly config: ShieldWebhookStrategyConfig) {}

  async evaluate(context: HasRequestHeader & HasRequestText): Promise<boolean> {
    const signature = v.safeParse(WebhookSignature, context.request.header(this.config.header));

    if (!signature.success) return false;

    const body = await context.request.text();

    return this.config.WebhookVerifier.verify(body, signature.output);
  }
}
