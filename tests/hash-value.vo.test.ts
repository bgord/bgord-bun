import { describe, expect, test } from "bun:test";
import { HashValue } from "../src/hash-value.vo";

describe("HashValue VO", () => {
  test("happy path", () => {
    expect(HashValue.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => HashValue.parse(null)).toThrow("hash.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => HashValue.parse(2024)).toThrow("hash.value.type");
  });

  test("rejects empty", () => {
    expect(() => HashValue.parse("")).toThrow("hash.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => HashValue.parse(`${"f".repeat(63)}x`)).toThrow("hash.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => HashValue.parse("f".repeat(65))).toThrow("hash.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => HashValue.parse("f".repeat(63))).toThrow("hash.value.invalid.hex");
  });
});
