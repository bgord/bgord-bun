import { describe, expect, test } from "bun:test";
import { EncryptionIV } from "../src/encryption-iv.vo";

describe("EncryptionIV VO", () => {
  test("generate", () => {
    expect(EncryptionIV.generate().length).toEqual(12);
  });
});
