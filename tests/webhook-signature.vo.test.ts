import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSignature } from "../src/webhook-signature.vo";

describe("WebhookSignature", () => {
  test("happy path", () => {
    expect(v.safeParse(WebhookSignature, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(WebhookSignature, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(WebhookSignature, null)).toThrow("webhook.signature.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(WebhookSignature, 123)).toThrow("webhook.signature.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(WebhookSignature, "")).toThrow("webhook.signature.empty");
  });

  test("rejects non-hex chars", () => {
    expect(() => v.parse(WebhookSignature, "too_short")).toThrow("webhook.signature.invalid.hex");
  });

  test("rejects multibyte chars", () => {
    expect(() => v.parse(WebhookSignature, "\u00e9".repeat(64))).toThrow("webhook.signature.invalid.hex");
  });
});
