import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ShieldWebhookStrategy } from "../src/shield-webhook.strategy";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const WebhookSignatureCreator = new WebhookSignatureCreatorSha256Strategy();

const header = "x-signature";
const body = "body";
const wrongBody = "wrong-body";
const secret = v.parse(WebhookSecret, "secret");
const signature = WebhookSignatureCreator.create(body, secret);
const wrongSignature = WebhookSignatureCreator.create(wrongBody, secret);

const WebhookVerifier = new WebhookVerifierSha256Strategy({ secret, WebhookSignatureCreator });

const strategy = new ShieldWebhookStrategy({ header, WebhookVerifier });

describe("ShieldWebhookStrategy", () => {
  test("evaluate - true", async () => {
    const context = new RequestContextBuilder().withHeader(header, signature).withText(body).build();

    expect(await strategy.evaluate(context)).toEqual(true);
  });

  test("evaluate - false - no signature", async () => {
    const context = new RequestContextBuilder().build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - wrong signature", async () => {
    const context = new RequestContextBuilder().withHeader(header, wrongSignature).withText(body).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - no text", async () => {
    const context = new RequestContextBuilder().withHeader(header, signature).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - wrong text", async () => {
    const context = new RequestContextBuilder().withHeader(header, signature).withText(wrongBody).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });
});
