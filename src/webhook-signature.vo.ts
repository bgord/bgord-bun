import * as v from "valibot";

export const WebhookSignatureError = {
  Type: "webhook.signature.type",
  Empty: "webhook.signature.empty",
  InvalidHex: "webhook.signature.invalid.hex",
};

// Hex chars allowed
const CHARS_WHITELIST = /^[a-fA-F0-9]+$/;

export const WebhookSignature = v.pipe(
  v.string(WebhookSignatureError.Type),
  v.nonEmpty(WebhookSignatureError.Empty),
  v.regex(CHARS_WHITELIST, WebhookSignatureError.InvalidHex),
  // Stryker disable next-line StringLiteral
  v.brand("WebhookSignature"),
);

export type WebhookSignatureType = v.InferOutput<typeof WebhookSignature>;
