import { describe, expect, test } from "bun:test";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

describe("EncryptionKey VO", () => {
  test("happy path", () => {
    expect(EncryptionKeyValue.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionKeyValue.parse(null)).toThrow("encryption.key.value.type");
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionKeyValue.parse(2024)).toThrow("encryption.key.value.type");
  });

  test("rejects empty", () => {
    expect(() => EncryptionKeyValue.parse("")).toThrow("encryption.key.value.invalid.hex");
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionKeyValue.parse(`${"f".repeat(63)}x`)).toThrow("encryption.key.value.invalid.hex");
  });

  test("rejects too long", () => {
    expect(() => EncryptionKeyValue.parse("f".repeat(65))).toThrow("encryption.key.value.invalid.hex");
  });

  test("rejects too short", () => {
    expect(() => EncryptionKeyValue.parse("f".repeat(63))).toThrow("encryption.key.value.invalid.hex");
  });
});
