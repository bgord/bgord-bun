import { describe, expect, test, spyOn } from "bun:test";
import { safeParseBody } from "../src/safe-parse-body.service";

function createMockContext(body: string) {
  return { req: { text: async () => body } } as any;
}

describe("safeParseBody service", () => {
  test("happy path", async () => {
    expect(await safeParseBody(createMockContext(JSON.stringify({ hello: "world" })))).toEqual({
      hello: "world",
    });
  });

  test("empty object for truly empty body", async () => {
    expect(await safeParseBody(createMockContext(""))).toEqual({});
  });

  test("empty object for invalid JSON body", async () => {
    expect(await safeParseBody(createMockContext("{ this is not json"))).toEqual({});
  });

  test("empty object for whitespace-only body", async () => {
    expect(await safeParseBody(createMockContext("   \n   "))).toEqual({});
  });

  test("optimization - avoids parsing whitespace-only body", async () => {
    const jsonParse = spyOn(JSON, "parse");

    await safeParseBody(createMockContext("   "));

    expect(jsonParse).not.toHaveBeenCalled();
  });
});
