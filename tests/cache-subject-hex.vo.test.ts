import { describe, expect, test } from "bun:test";
import { CacheSubjectHex, CacheSubjectHexError } from "../src/cache-subject-hex.vo";

describe("CacheSubjectHex VO", () => {
  test("happy path", () => {
    expect(CacheSubjectHex.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => CacheSubjectHex.parse(null)).toThrow(CacheSubjectHexError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => CacheSubjectHex.parse(2024)).toThrow(CacheSubjectHexError.Type);
  });

  test("rejects empty", () => {
    expect(() => CacheSubjectHex.parse("")).toThrow(CacheSubjectHexError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => CacheSubjectHex.parse(`${"f".repeat(63)}x`)).toThrow(CacheSubjectHexError.InvalidHex);
  });
});
