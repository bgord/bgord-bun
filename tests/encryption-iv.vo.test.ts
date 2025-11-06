import { describe, expect, test } from "bun:test";
import { EncryptionIV } from "../src/encryption-iv.vo";
import { EncryptionIvValue } from "../src/encryption-iv-value.vo";

describe("EncryptionIV", () => {
  test("generate", () => {
    expect(EncryptionIvValue.safeParse(EncryptionIV.generate()).success).toEqual(true);
  });
});
