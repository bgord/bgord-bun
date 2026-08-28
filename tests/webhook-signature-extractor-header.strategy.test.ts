import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookSignatureExtractorHeaderStrategy } from "../src/webhook-signature-extractor-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const header = "x-signature";
const signature = v.parse(WebhookSignature, "abc123");
const extractor = new WebhookSignatureExtractorHeaderStrategy(header);

describe("WebhookSignatureExtractorHeaderStrategy", () => {
  test("extract", () => {
    const context = new RequestContextBuilder().withHeader(header, signature).build();

    expect(extractor.extract(context)).toEqual(signature);
  });

  test("no header", () => {
    const context = new RequestContextBuilder().build();

    expect(extractor.extract(context)).toBeNull();
  });
});
