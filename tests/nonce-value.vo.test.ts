import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { NonceValue } from "../src/nonce-value.vo";

describe("NonceValue", () => {
  test("happy path", () => {
    expect(v.safeParse(NonceValue, "f".repeat(16)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(NonceValue, null)).toThrow("nonce.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(NonceValue, 2024)).toThrow("nonce.value.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(NonceValue, "")).toThrow("nonce.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => v.parse(NonceValue, `${"f".repeat(15)}x`)).toThrow("nonce.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => v.parse(NonceValue, "f".repeat(17))).toThrow("nonce.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => v.parse(NonceValue, "f".repeat(15))).toThrow("nonce.value.invalid.hex");
  });
});
