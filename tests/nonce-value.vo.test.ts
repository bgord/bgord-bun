import { describe, expect, test } from "bun:test";
import { NonceValue } from "../src/nonce-value.vo";

describe("NonceValue VO", () => {
  test("happy path", () => {
    expect(NonceValue.safeParse("f".repeat(16)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => NonceValue.parse(null)).toThrow("nonce.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => NonceValue.parse(2024)).toThrow("nonce.value.type");
  });

  test("rejects empty", () => {
    expect(() => NonceValue.parse("")).toThrow("nonce.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => NonceValue.parse(`${"f".repeat(15)}x`)).toThrow("nonce.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => NonceValue.parse("f".repeat(17))).toThrow("nonce.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => NonceValue.parse("f".repeat(15))).toThrow("nonce.value.invalid.hex");
  });
});
