import { describe, expect, spyOn, test } from "bun:test";
import { EncryptionIV } from "../src/encryption-iv.vo";

describe("EncryptionIV", () => {
  test("generate", () => {
    using getRandomValues = spyOn(crypto, "getRandomValues").mockImplementation((iv: Uint8Array) => {
      iv.fill(7);
      return iv;
    });

    expect(EncryptionIV.generate()).toEqual(new Uint8Array(12).fill(7));
    expect(getRandomValues).toHaveBeenCalled();
  });
});
