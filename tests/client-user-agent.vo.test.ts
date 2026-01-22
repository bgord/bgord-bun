import { describe, expect, test } from "bun:test";
import { ClientUserAgent } from "../src/client-user-agent.vo";

describe("ClientUserAgent VO", () => {
  test("happy path", () => {
    expect(ClientUserAgent.safeParse("a".repeat(256)).success).toEqual(true);
    expect(ClientUserAgent.safeParse("A".repeat(256)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => ClientUserAgent.parse(null)).toThrow("client.user.agent.type");
  });

  test("rejects non-string - number", () => {
    expect(() => ClientUserAgent.parse(123)).toThrow("client.user.agent.type");
  });

  test("rejects empty", () => {
    expect(() => ClientUserAgent.parse("")).toThrow("client.user.agent.invalid");
  });

  test("rejects too long", () => {
    expect(() => ClientUserAgent.parse(`${"a".repeat(255)}a`)).toThrow("client.user.agent.invalid");
  });

  test("rejects control characters", () => {
    expect(() => ClientUserAgent.parse("\n")).toThrow("client.user.agent.invalid");
    expect(() => ClientUserAgent.parse("\u0000")).toThrow("client.user.agent.invalid");
  });

  test("rejects unicode emoji", () => {
    expect(() => ClientUserAgent.parse("🔥")).toThrow("client.user.agent.invalid");
  });
});
