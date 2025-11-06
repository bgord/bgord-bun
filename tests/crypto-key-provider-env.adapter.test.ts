import { describe, expect, spyOn, test } from "bun:test";
import { CryptoKeyProviderEnvAdapter } from "../src/crypto-key-provider-env.adapter";
import { EncryptionKey } from "../src/encryption-key.vo";

const HEX = EncryptionKey.parse("000102030405060708090a0b0c0d0e0f" + "000102030405060708090a0b0c0d0e0f");

const adapter = new CryptoKeyProviderEnvAdapter(HEX);

describe("CryptoKeyProviderEnvAdapter", () => {
  test("get", async () => {
    const importSpy = spyOn(crypto.subtle, "importKey").mockResolvedValue({} as any);

    const result = await adapter.get();

    expect(result).toEqual({} as any);
    expect(importSpy).toHaveBeenCalledWith("raw", expect.any(Uint8Array), { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  });
});
