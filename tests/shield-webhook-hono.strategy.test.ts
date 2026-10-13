import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { ErrorClassifierHttpExceptionHonoStrategy } from "../src/error-classifier-http-exception-hono.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { HttpExceptionErrors } from "../src/http-exception-errors";
import { IdempotencyStoreCacheAdapter } from "../src/idempotency-store-cache.adapter";
import { IdempotencyStoreNoopAdapter } from "../src/idempotency-store-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { ShieldWebhookHonoStrategy } from "../src/shield-webhook-hono.strategy";
import { WebhookBodyBuilderTextStrategy } from "../src/webhook-body-builder-text.strategy";
import { WebhookIdExtractorHeaderStrategy } from "../src/webhook-id-extractor-header.strategy";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookSignatureExtractorHeaderStrategy } from "../src/webhook-signature-extractor-header.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";

const onError = new ErrorHonoHandler([new ErrorClassifierHttpExceptionHonoStrategy([HttpExceptionErrors])], {
  Logger: new LoggerNoopAdapter(),
}).handle();

const header = "x-signature";
const idHeader = "x-webhook-id";
const namespace = "stripe";
const otherNamespace = "github";
const id = "evt_123";
const invalidId = "";
const body = "body";
const wrongBody = "wrong-body";
const secret = v.parse(WebhookSecret, "secret");

const WebhookSignatureCreator = new WebhookSignatureCreatorSha256Strategy(secret);
const signature = WebhookSignatureCreator.create(body);
const wrongSignature = WebhookSignatureCreator.create(wrongBody);

const config = {
  namespace,
  WebhookBodyBuilder: new WebhookBodyBuilderTextStrategy(),
  WebhookIdExtractor: new WebhookIdExtractorHeaderStrategy(idHeader),
  WebhookSignatureExtractor: new WebhookSignatureExtractorHeaderStrategy(header),
  WebhookVerifier: new WebhookVerifierSha256Strategy({ WebhookSignatureCreator }),
};

const IdempotencyStore = new IdempotencyStoreNoopAdapter();
const HashContent = new HashContentSha256Strategy();
const deps = { IdempotencyStore, HashContent };

const app = new Hono()
  .post("/webhook", new ShieldWebhookHonoStrategy(config, deps).handle(), () => new Response("ok"))
  .onError(onError);

describe("ShieldWebhookHonoStrategy", () => {
  test("evaluate - true", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: signature, [idHeader]: id },
    });

    expect(response.status).toEqual(200);
  });

  test("evaluate - false - no signature", async () => {
    const response = await app.request("/webhook", { method: "POST", body, headers: { [idHeader]: id } });
    const json = await response.json();

    expect(response.status).toEqual(401);
    expect(json.message).toEqual("shield.webhook.rejected");
  });

  test("evaluate - false - wrong signature", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: wrongSignature, [idHeader]: id },
    });

    expect(response.status).toEqual(401);
  });

  test("evaluate - false - no body", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      headers: { [header]: signature, [idHeader]: id },
    });

    expect(response.status).toEqual(401);
  });

  test("evaluate - false - wrong body", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body: wrongBody,
      headers: { [header]: signature, [idHeader]: id },
    });

    expect(response.status).toEqual(401);
  });

  test("evaluate - false - no id", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: signature },
    });

    expect(response.status).toEqual(401);
  });

  test("evaluate - false - invalid id", async () => {
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: signature, [idHeader]: invalidId },
    });

    expect(response.status).toEqual(401);
  });

  test("evaluate - duplicate - replay", async () => {
    const ShieldWebhook = new ShieldWebhookHonoStrategy(config, {
      HashContent,
      IdempotencyStore: new IdempotencyStoreCacheAdapter({
        CacheRepository: new CacheRepositoryNodeCacheAdapter({
          type: "finite",
          ttl: tools.Duration.Hours(1),
        }),
      }),
    });
    const app = new Hono()
      .post("/webhook", ShieldWebhook.handle(), () => new Response("ok"))
      .onError(onError);

    await app.request("/webhook", { method: "POST", body, headers: { [header]: signature, [idHeader]: id } });
    const response = await app.request("/webhook", {
      method: "POST",
      body,
      headers: { [header]: signature, [idHeader]: id },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.message).toEqual("shield.webhook.duplicate");
  });

  test("evaluate - true - cross namespace", async () => {
    const IdempotencyStore = new IdempotencyStoreCacheAdapter({
      CacheRepository: new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) }),
    });
    const app = new Hono()
      .post(
        "/webhook",
        new ShieldWebhookHonoStrategy(config, { HashContent, IdempotencyStore }).handle(),
        () => Response.json({ handled: true }),
      )
      .post(
        "/other-webhook",
        new ShieldWebhookHonoStrategy(
          { ...config, namespace: otherNamespace },
          { HashContent, IdempotencyStore },
        ).handle(),
        () => Response.json({ handled: true }),
      );

    await app.request("/webhook", { method: "POST", body, headers: { [header]: signature, [idHeader]: id } });
    const response = await app.request("/other-webhook", {
      method: "POST",
      body,
      headers: { [header]: signature, [idHeader]: id },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.handled).toEqual(true);
  });
});
