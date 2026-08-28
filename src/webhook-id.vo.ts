import * as v from "valibot";

export const WebhookIdError = {
  Type: "webhook.id.type",
  Empty: "webhook.id.empty",
};

export const WebhookId = v.pipe(
  v.string(WebhookIdError.Type),
  v.nonEmpty(WebhookIdError.Empty),
  // Stryker disable next-line StringLiteral
  v.brand("WebhookId"),
);

export type WebhookIdType = v.InferOutput<typeof WebhookId>;
