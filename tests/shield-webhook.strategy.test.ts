import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { IdempotencyStoreNoopAdapter } from "../src/idempotency-store-noop.adapter";
import { IdempotencyStoreCacheAdapter } from "../src/idempotency-store-cache.adapter";
import { ShieldWebhookStrategy } from "../src/shield-webhook.strategy";
import { WebhookBodyBuilderTextStrategy } from "../src/webhook-body-builder-text.strategy";
import { WebhookIdExtractorHeaderStrategy } from "../src/webhook-id-extractor-header.strategy";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookSignatureExtractorHeaderStrategy } from "../src/webhook-signature-extractor-header.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const header = "x-signature";
const idHeader = "x-webhook-id";
const id = "evt_123";
const invalidId = "";
const body = "body";
const wrongBody = "wrong-body";
const secret = v.parse(WebhookSecret, "secret");

const WebhookSignatureCreator = new WebhookSignatureCreatorSha256Strategy(secret);
const signature = WebhookSignatureCreator.create(body);
const wrongSignature = WebhookSignatureCreator.create(wrongBody);

const config = {
  WebhookBodyBuilder: new WebhookBodyBuilderTextStrategy(),
  WebhookIdExtractor: new WebhookIdExtractorHeaderStrategy(idHeader),
  WebhookSignatureExtractor: new WebhookSignatureExtractorHeaderStrategy(header),
  WebhookVerifier: new WebhookVerifierSha256Strategy({ WebhookSignatureCreator }),
};

const IdempotencyStore = new IdempotencyStoreNoopAdapter();
const HashContent = new HashContentSha256Strategy();
const deps = { IdempotencyStore, HashContent };

const strategy = new ShieldWebhookStrategy(config, deps);

describe("ShieldWebhookStrategy", () => {
  test("evaluate - true", async () => {
    const context = new RequestContextBuilder()
      .withHeader(header, signature)
      .withHeader(idHeader, id)
      .withText(body)
      .build();

    expect(await strategy.evaluate(context)).toEqual(true);
  });

  test("evaluate - false - no signature", async () => {
    const context = new RequestContextBuilder().withHeader(idHeader, id).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - wrong signature", async () => {
    const context = new RequestContextBuilder()
      .withHeader(header, wrongSignature)
      .withHeader(idHeader, id)
      .withText(body)
      .build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - no text", async () => {
    const context = new RequestContextBuilder()
      .withHeader(header, signature)
      .withHeader(idHeader, id)
      .build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - wrong text", async () => {
    const context = new RequestContextBuilder()
      .withHeader(header, signature)
      .withHeader(idHeader, id)
      .withText(wrongBody)
      .build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - no id", async () => {
    const context = new RequestContextBuilder().withHeader(header, signature).withText(body).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - invalid id", async () => {
    const context = new RequestContextBuilder()
      .withHeader(header, signature)
      .withHeader(idHeader, invalidId)
      .withText(body)
      .build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("evaluate - false - replay", async () => {
    const strategy = new ShieldWebhookStrategy(config, {
      HashContent,
      IdempotencyStore: new IdempotencyStoreCacheAdapter({
        CacheRepository: new CacheRepositoryNodeCacheAdapter({
          type: "finite",
          ttl: tools.Duration.Hours(1),
        }),
      }),
    });
    const context = new RequestContextBuilder()
      .withHeader(header, signature)
      .withHeader(idHeader, id)
      .withText(body)
      .build();

    await strategy.evaluate(context);

    expect(await strategy.evaluate(context)).toEqual(false);
  });
});
