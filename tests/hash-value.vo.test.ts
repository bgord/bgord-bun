import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { HashValue } from "../src/hash-value.vo";

describe("HashValue", () => {
  test("happy path", () => {
    expect(v.safeParse(HashValue, "f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(HashValue, null)).toThrow("hash.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(HashValue, 2024)).toThrow("hash.value.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(HashValue, "")).toThrow("hash.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => v.parse(HashValue, `${"f".repeat(63)}x`)).toThrow("hash.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => v.parse(HashValue, "f".repeat(65))).toThrow("hash.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => v.parse(HashValue, "f".repeat(63))).toThrow("hash.value.invalid.hex");
  });
});
