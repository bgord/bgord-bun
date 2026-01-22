import { describe, expect, spyOn, test } from "bun:test";
import { safeParseBody } from "../src/safe-parse-body.service";

function createMockContext(body: string) {
  return { req: { text: async () => body } };
}

describe("safeParseBody service", () => {
  test("happy path", async () => {
    // @ts-expect-error TODO
    expect(await safeParseBody(createMockContext(JSON.stringify({ hello: "world" })))).toEqual({
      hello: "world",
    });
  });

  test("empty object for truly empty body", async () => {
    // @ts-expect-error TODO
    expect(await safeParseBody(createMockContext(""))).toEqual({});
  });

  test("empty object for invalid JSON body", async () => {
    // @ts-expect-error TODO
    expect(await safeParseBody(createMockContext("{ this is not json"))).toEqual({});
  });

  test("empty object for whitespace-only body", async () => {
    // @ts-expect-error TODO
    expect(await safeParseBody(createMockContext("   \n   "))).toEqual({});
  });

  test("optimization - avoids parsing whitespace-only body", async () => {
    const jsonParse = spyOn(JSON, "parse");

    // @ts-expect-error TODO
    await safeParseBody(createMockContext("   "));

    expect(jsonParse).not.toHaveBeenCalled();
  });
});
