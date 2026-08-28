import * as v from "valibot";

export const WebhookIdError = {
  Type: "webhook.id.type",
  Empty: "webhook.id.empty",
  TooLong: "webhook.id.too.long",
};

export const WebhookId = v.pipe(
  v.string(WebhookIdError.Type),
  v.minLength(1, WebhookIdError.Empty),
  v.maxLength(128, WebhookIdError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("WebhookId"),
);

export type WebhookIdType = v.InferOutput<typeof WebhookId>;
