import { describe, expect, test } from "bun:test";
import { ClientUserAgent, ClientUserAgentError } from "../src/client-user-agent.vo";

describe("ClientUserAgent VO", () => {
  test("happy path", () => {
    expect(ClientUserAgent.safeParse("a".repeat(128)).success).toEqual(true);
    expect(ClientUserAgent.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => ClientUserAgent.parse(null)).toThrow(ClientUserAgentError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => ClientUserAgent.parse(123)).toThrow(ClientUserAgentError.Type);
  });

  test("rejects empty", () => {
    expect(() => ClientUserAgent.parse("")).toThrow(ClientUserAgentError.Empty);
  });

  test("rejects too long", () => {
    expect(() => ClientUserAgent.parse(`${"a".repeat(128)}a`)).toThrow(ClientUserAgentError.TooLong);
  });
});
