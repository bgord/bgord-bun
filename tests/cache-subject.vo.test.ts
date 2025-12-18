import { describe, expect, test } from "bun:test";
import { CacheSubject, CacheSubjectError } from "../src/cache-subject.vo";

describe("CacheSubjectHex VO", () => {
  test("happy path", () => {
    expect(CacheSubject.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => CacheSubject.parse(null)).toThrow(CacheSubjectError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => CacheSubject.parse(2024)).toThrow(CacheSubjectError.Type);
  });

  test("rejects empty", () => {
    expect(() => CacheSubject.parse("")).toThrow(CacheSubjectError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => CacheSubject.parse(`${"f".repeat(63)}x`)).toThrow(CacheSubjectError.InvalidHex);
  });
});
