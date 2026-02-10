import { describe, expect, spyOn, test } from "bun:test";
import { CryptoKeyProviderMemoryAdapter } from "../src/crypto-key-provider-memory.adapter";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const HEX = EncryptionKeyValue.parse("000102030405060708090a0b0c0d0e0f" + "000102030405060708090a0b0c0d0e0f");

const adapter = new CryptoKeyProviderMemoryAdapter(HEX);

describe("CryptoKeyProviderMemoryAdapter", () => {
  test("get", async () => {
    using importKey = spyOn(crypto.subtle, "importKey");

    await adapter.get();

    expect(importKey).toHaveBeenCalledWith("raw", expect.any(Uint8Array), { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  });
});
