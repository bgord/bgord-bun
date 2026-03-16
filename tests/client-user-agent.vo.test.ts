import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ClientUserAgent } from "../src/client-user-agent.vo";

describe("ClientUserAgent", () => {
  test("happy path", () => {
    expect(v.safeParse(ClientUserAgent, "a".repeat(256)).success).toEqual(true);
    expect(v.safeParse(ClientUserAgent, "A".repeat(256)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(ClientUserAgent, null)).toThrow("client.user.agent.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(ClientUserAgent, 123)).toThrow("client.user.agent.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(ClientUserAgent, "")).toThrow("client.user.agent.invalid");
  });

  test("rejects too long", () => {
    expect(() => v.parse(ClientUserAgent, `${"a".repeat(257)}a`)).toThrow("client.user.agent.invalid");
  });

  test("rejects control characters", () => {
    expect(() => v.parse(ClientUserAgent, "\n")).toThrow("client.user.agent.invalid");
    expect(() => v.parse(ClientUserAgent, "\u0000")).toThrow("client.user.agent.invalid");
  });

  test("rejects emoji", () => {
    expect(() => v.parse(ClientUserAgent, "🔥")).toThrow("client.user.agent.invalid");
  });
});
