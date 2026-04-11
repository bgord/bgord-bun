import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookSignatureCreatorNoopStrategy } from "../src/webhook-signature-creator-noop.strategy";

const signature = v.parse(WebhookSignature, "noop");
const body = "test-body";

const creator = new WebhookSignatureCreatorNoopStrategy(signature);

describe("WebhookSignatureCreatorNoopStrategy", () => {
  test("happy path", () => {
    expect(creator.create(body)).toEqual(signature);
  });
});
