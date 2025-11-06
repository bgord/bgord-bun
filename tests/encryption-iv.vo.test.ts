import { describe, expect, test } from "bun:test";
import { EncryptionIv, EncryptionIvError } from "../src/encryption-iv.vo";

describe("EncryptionIv", () => {
  test("happy path", () => {
    expect(EncryptionIv.safeParse("f".repeat(24)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionIv.parse(null)).toThrow(EncryptionIvError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionIv.parse(2024)).toThrow(EncryptionIvError.Type);
  });

  test("rejects empty", () => {
    expect(() => EncryptionIv.parse("")).toThrow(EncryptionIvError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionIv.parse(`${"f".repeat(23)}x`)).toThrow(EncryptionIvError.InvalidHex);
  });
});
