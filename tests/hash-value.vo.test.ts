import { describe, expect, test } from "bun:test";
import { HashValue, HashValueError } from "../src/hash-value.vo";

describe("HashValue VO", () => {
  test("happy path", () => {
    expect(HashValue.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HashValue.parse(null)).toThrow(HashValueError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => HashValue.parse(2024)).toThrow(HashValueError.Type);
  });

  test("rejects empty", () => {
    expect(() => HashValue.parse("")).toThrow(HashValueError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => HashValue.parse(`${"f".repeat(63)}x`)).toThrow(HashValueError.InvalidHex);
  });
});
