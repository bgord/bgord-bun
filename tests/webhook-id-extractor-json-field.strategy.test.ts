import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookId } from "../src/webhook-id.vo";
import { WebhookIdExtractorJsonFieldStrategy } from "../src/webhook-id-extractor-json-field.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const field = "id";
const id = v.parse(WebhookId, "evt_123");
const extractor = new WebhookIdExtractorJsonFieldStrategy(field);

describe("WebhookIdExtractorJsonFieldStrategy", () => {
  test("extract", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: id }).build();

    expect(await extractor.extract(context)).toEqual(id);
  });

  test("no field", async () => {
    const context = new RequestContextBuilder().withJson({}).build();

    expect(await extractor.extract(context)).toBeNull();
  });

  test("empty field", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: "" }).build();

    expect(await extractor.extract(context)).toBeNull();
  });

  test("invalid field", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: 123 }).build();

    expect(await extractor.extract(context)).toBeNull();
  });

  test("empty body", async () => {
    const context = new RequestContextBuilder().build();

    expect(await extractor.extract(context)).toBeNull();
  });
});
