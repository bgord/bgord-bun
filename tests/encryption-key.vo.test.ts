import { describe, expect, test } from "bun:test";
import { EncryptionKey, EncryptionKeyError } from "../src/encryption-key.vo";

describe("EncryptionKey VO", () => {
  test("happy path", () => {
    expect(EncryptionKey.safeParse("f".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionKey.parse(null)).toThrow(EncryptionKeyError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionKey.parse(2024)).toThrow(EncryptionKeyError.Type);
  });

  test("rejects empty", () => {
    expect(() => EncryptionKey.parse("")).toThrow(EncryptionKeyError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionKey.parse(`${"f".repeat(63)}x`)).toThrow(EncryptionKeyError.InvalidHex);
  });
});
