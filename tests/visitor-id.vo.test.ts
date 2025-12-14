import { describe, expect, test } from "bun:test";
import { VisitorId, VisitorIdError } from "../src/visitor-id.vo";

describe("BasicAuthPassword VO", () => {
  test("happy path", () => {
    expect(VisitorId.safeParse("a".repeat(16)).success).toEqual(true);
    expect(VisitorId.safeParse("A".repeat(16)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => VisitorId.parse(null)).toThrow(VisitorIdError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => VisitorId.parse(123)).toThrow(VisitorIdError.Type);
  });

  test("rejects empty", () => {
    expect(() => VisitorId.parse("")).toThrow(VisitorIdError.Empty);
  });

  test("rejects too long", () => {
    expect(() => VisitorId.parse(`${"a".repeat(16)}a`)).toThrow(VisitorIdError.TooLong);
  });
});
