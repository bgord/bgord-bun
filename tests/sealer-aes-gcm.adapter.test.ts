import { describe, expect, spyOn, test } from "bun:test";
import { CryptoAesGcm } from "../src/crypto-aes-gcm.service";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";
import { SealerAesGcmAdapter } from "../src/sealer-aes-gcm.adapter";

const CryptoKeyProvider = new CryptoKeyProviderNoopAdapter();
const deps = { CryptoKeyProvider };
const adapter = new SealerAesGcmAdapter(deps);

const input = { name: "John", age: 42 };

const iv = new Uint8Array(Array.from({ length: 12 }, (_, index) => index + 1));
const plaintext = new TextEncoder().encode(JSON.stringify(input));
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encrypted = new Uint8Array(iv.length + ciphertext.length);
encrypted.set(iv, 0);
encrypted.set(ciphertext, iv.length);

const sealedValue = "sealed:gcm:" + Buffer.from(encrypted).toString("base64");

describe("SealerAesGcmAdapter", () => {
  test("seal", async () => {
    using encryptionIvGenerate = spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    using cryptoAesGcmEncrypt = spyOn(CryptoAesGcm, "encrypt").mockResolvedValue(encrypted);

    const result = await adapter.seal(input);

    expect(result).toEqual(sealedValue);
    expect(encryptionIvGenerate).toHaveBeenCalled();
    expect(cryptoAesGcmEncrypt).toHaveBeenCalled();
  });

  test("unseal", async () => {
    using cryptoAesGcmDecrypt = spyOn(CryptoAesGcm, "decrypt").mockResolvedValue(plaintext.buffer);

    const result = await adapter.unseal(sealedValue);

    expect(result).toEqual(input);
    // @ts-expect-error Partial access
    expect(encrypted).toEqual(new Uint8Array(cryptoAesGcmDecrypt.mock.calls[0][1]));
  });

  test("unseal - invalid payload", async () => {
    expect(adapter.unseal("invalid:payload")).rejects.toThrow("sealer.aes.gcm.adapter.invalid.payload");
  });
});
