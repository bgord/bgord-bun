import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { ShieldWebhookStrategyError } from "../src/shield-webhook.strategy";
import { ShieldWebhookHonoStrategy } from "../src/shield-webhook-hono.strategy";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";

const WebhookSignatureCreator = new WebhookSignatureCreatorSha256Strategy();

const header = "x-signature";
const body = "body";
const wrongBody = "wrong-body";
const secret = v.parse(WebhookSecret, "secret");
const signature = WebhookSignatureCreator.create(body, secret);
const wrongSignature = WebhookSignatureCreator.create(wrongBody, secret);

const WebhookVerifier = new WebhookVerifierSha256Strategy({ secret, WebhookSignatureCreator });
const ShieldWebhook = new ShieldWebhookHonoStrategy({ header, WebhookVerifier });

const app = new Hono()
  .post("/webhook", ShieldWebhook.handle(), (c) => c.text("ok"))
  .onError((error, c) => {
    if (error.message === ShieldWebhookStrategyError.Rejected) {
      return c.json({ message: ShieldWebhookStrategyError.Rejected, _known: true }, 403);
    }
    return c.json({}, 500);
  });
describe("ShieldWebhookHonoStrategy", () => {
  test("evaluate - true", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: signature },
    });

    expect(response.status).toEqual(200);
  });

  test("evaluate - false - no signature", async () => {
    const response = await app.request("/webhook", { method: "POST", body });
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("shield.webhook.rejected");
  });

  test("evaluate - false - wrong signature", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: wrongSignature },
    });

    expect(response.status).toEqual(403);
  });

  test("evaluate - false - no body", async () => {
    const response = await app.request("/webhook", { method: "POST", headers: { [header]: signature } });

    expect(response.status).toEqual(403);
  });

  test("evaluate - false - wrong body", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body: wrongBody,
      headers: { [header]: signature },
    });

    expect(response.status).toEqual(403);
  });
});
