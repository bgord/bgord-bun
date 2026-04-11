import * as v from "valibot";

export const WebhookSecretError = {
  Type: "webhook.secret.type",
  Empty: "webhook.secret.empty",
};

export const WebhookSecret = v.pipe(
  v.string(WebhookSecretError.Type),
  v.nonEmpty(WebhookSecretError.Empty),
  v.brand("WebhookSecret"),
);

export type WebhookSecretType = v.InferOutput<typeof WebhookSecret>;
