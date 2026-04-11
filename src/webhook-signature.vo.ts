import * as v from "valibot";

export const WebhookSignatureError = {
  Type: "webhook.signature.type",
  Empty: "webhook.signature.empty",
};

export const WebhookSignature = v.pipe(
  v.string(WebhookSignatureError.Type),
  v.nonEmpty(WebhookSignatureError.Empty),
  // Stryker disable next-line StringLiteral
  v.brand("WebhookSignature"),
);

export type WebhookSignatureType = v.InferOutput<typeof WebhookSignature>;
