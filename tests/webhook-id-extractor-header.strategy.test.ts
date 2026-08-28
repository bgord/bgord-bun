import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookId } from "../src/webhook-id.vo";
import { WebhookIdExtractorHeaderStrategy } from "../src/webhook-id-extractor-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const header = "x-webhook-id";
const id = v.parse(WebhookId, "evt_123");
const extractor = new WebhookIdExtractorHeaderStrategy(header);

describe("WebhookIdExtractorHeaderStrategy", () => {
  test("extract", async () => {
    const context = new RequestContextBuilder().withHeader(header, id).build();

    expect(await extractor.extract(context)).toEqual(id);
  });

  test("no header", async () => {
    const context = new RequestContextBuilder().build();

    expect(await extractor.extract(context)).toBeNull();
  });

  test("too long header", async () => {
    const context = new RequestContextBuilder().withHeader(header, "a".repeat(129)).build();

    expect(await extractor.extract(context)).toBeNull();
  });

  test("empty header", async () => {
    const context = new RequestContextBuilder().withHeader(header, "").build();

    expect(await extractor.extract(context)).toBeNull();
  });
});
