import { describe, expect, test } from "bun:test";
import { ClientUserAgent } from "../src/client-user-agent.vo";

describe("ClientUserAgent VO", () => {
  test("happy path", () => {
    expect(ClientUserAgent.safeParse("a".repeat(128)).success).toEqual(true);
    expect(ClientUserAgent.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => ClientUserAgent.parse(null)).toThrow("client.user.agent.type");
  });

  test("rejects non-string - number", () => {
    expect(() => ClientUserAgent.parse(123)).toThrow("client.user.agent.type");
  });

  test("rejects empty", () => {
    expect(() => ClientUserAgent.parse("")).toThrow("client.user.agent.empty");
  });

  test("rejects too long", () => {
    expect(() => ClientUserAgent.parse(`${"a".repeat(128)}a`)).toThrow("client.user.agent.too.long");
  });
});
