import { describe, expect, test } from "bun:test";
import { EncryptionKeyValue, EncryptionKeyValueError } from "../src/encryption-key-value.vo";

describe("EncryptionKey VO", () => {
  test("happy path", () => {
    expect(EncryptionKeyValue.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionKeyValue.parse(null)).toThrow(EncryptionKeyValueError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionKeyValue.parse(2024)).toThrow(EncryptionKeyValueError.Type);
  });

  test("rejects empty", () => {
    expect(() => EncryptionKeyValue.parse("")).toThrow(EncryptionKeyValueError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionKeyValue.parse(`${"f".repeat(63)}x`)).toThrow(EncryptionKeyValueError.InvalidHex);
  });
});
