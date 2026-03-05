import { describe, expect, test } from "bun:test";
import { EncryptionIV } from "../src/encryption-iv.vo";

describe("EncryptionIV", () => {
  test("generate", () => {
    expect(EncryptionIV.generate().length).toEqual(12);
  });
});
