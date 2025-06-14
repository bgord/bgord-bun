import { describe, expect, test } from "bun:test";
import { safeParseBody } from "../src/safe-parse-body.service";

function createMockContext(body: string) {
  return { req: { text: async () => body } } as any;
}

describe("safeParseBody", () => {
  test("returns empty object for truly empty body", async () => {
    const c = createMockContext("");
    const result = await safeParseBody(c);
    expect(result).toEqual({});
  });

  test("parses valid JSON body", async () => {
    const c = createMockContext(JSON.stringify({ hello: "world" }));
    const result = await safeParseBody(c);
    expect(result).toEqual({ hello: "world" });
  });

  test("returns empty object for invalid JSON body", async () => {
    const c = createMockContext("{ this is not json");
    const result = await safeParseBody(c);
    expect(result).toEqual({});
  });

  test("returns empty object for whitespace-only body", async () => {
    const c = createMockContext("   \n   ");
    const result = await safeParseBody(c);
    expect(result).toEqual({});
  });
});
