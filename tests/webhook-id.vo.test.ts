import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookId } from "../src/webhook-id.vo";

describe("WebhookId", () => {
  test("happy path", () => {
    expect(v.safeParse(WebhookId, "evt_123").success).toEqual(true);
    expect(v.safeParse(WebhookId, "a").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(WebhookId, null)).toThrow("webhook.id.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(WebhookId, 123)).toThrow("webhook.id.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(WebhookId, "")).toThrow("webhook.id.empty");
  });
});
