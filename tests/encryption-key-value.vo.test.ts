import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

describe("EncryptionKeyValue", () => {
  test("happy path", () => {
    expect(v.safeParse(EncryptionKeyValue, "f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(EncryptionKeyValue, null)).toThrow("encryption.key.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(EncryptionKeyValue, 2024)).toThrow("encryption.key.value.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(EncryptionKeyValue, "")).toThrow("encryption.key.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => v.parse(EncryptionKeyValue, `${"f".repeat(63)}x`)).toThrow(
      "encryption.key.value.invalid.hex",
    );
  });

  test("rejects too long", () => {
    expect(() => v.parse(EncryptionKeyValue, "f".repeat(65))).toThrow("encryption.key.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => v.parse(EncryptionKeyValue, "f".repeat(63))).toThrow("encryption.key.value.invalid.hex");
  });
});
