import { describe, expect, test } from "bun:test";
import { EncryptionIvValue, EncryptionIvValueError } from "../src/encryption-iv-value.vo";

describe("EncryptionIvValue", () => {
  test("happy path", () => {
    expect(EncryptionIvValue.safeParse("f".repeat(24)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => EncryptionIvValue.parse(null)).toThrow(EncryptionIvValueError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => EncryptionIvValue.parse(2024)).toThrow(EncryptionIvValueError.Type);
  });

  test("rejects empty", () => {
    expect(() => EncryptionIvValue.parse("")).toThrow(EncryptionIvValueError.InvalidHex);
  });

  test("rejects invalid hex", () => {
    expect(() => EncryptionIvValue.parse(`${"f".repeat(23)}x`)).toThrow(EncryptionIvValueError.InvalidHex);
  });
});
