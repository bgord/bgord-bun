import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSecret } from "../src/webhook-secret.vo";

describe("WebhookSecret", () => {
  test("happy path", () => {
    expect(v.safeParse(WebhookSecret, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(WebhookSecret, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(WebhookSecret, null)).toThrow("webhook.secret.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(WebhookSecret, 123)).toThrow("webhook.secret.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(WebhookSecret, "")).toThrow("webhook.secret.empty");
  });
});
