import { describe, expect, test } from "bun:test";
import { EncryptionSalt, EncryptionSaltError } from "../src/encryption-salt.vo";

describe("EncryptionSalt", () => {
  test("happy path", () => {
    expect(EncryptionSalt.safeParse("f".repeat(32)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionSalt.parse(null)).toThrow(EncryptionSaltError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionSalt.parse(2024)).toThrow(EncryptionSaltError.Type);
  });

  test("rejects empty", () => {
    expect(() => EncryptionSalt.parse("")).toThrow(EncryptionSaltError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionSalt.parse(`${"f".repeat(31)}x`)).toThrow(EncryptionSaltError.InvalidHex);
  });
});
