import { describe, expect, test } from "bun:test";
import { safeParseBody } from "../src/safe-parse-body.service";

function createMockContext(body: string) {
  return { req: { text: async () => body } } as any;
}

describe("safeParseBody", () => {
  test("returns empty object for truly empty body", async () => {
    const result = await safeParseBody(createMockContext(""));

    expect(result).toEqual({});
  });

  test("parses valid JSON body", async () => {
    const result = await safeParseBody(createMockContext(JSON.stringify({ hello: "world" })));

    expect(result).toEqual({ hello: "world" });
  });

  test("returns empty object for invalid JSON body", async () => {
    const result = await safeParseBody(createMockContext("{ this is not json"));

    expect(result).toEqual({});
  });

  test("returns empty object for whitespace-only body", async () => {
    const result = await safeParseBody(createMockContext("   \n   "));

    expect(result).toEqual({});
  });
});
