import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookVerifierNoopStrategy } from "../src/webhook-verifier-noop.strategy";

const body = "test-body";

const signature = v.parse(WebhookSignature, "noop");

const verifier = new WebhookVerifierNoopStrategy();

describe("WebhookVerifierNoopStrategy", () => {
  test("verify", () => {
    expect(verifier.verify(body, signature)).toEqual(true);
  });
});
