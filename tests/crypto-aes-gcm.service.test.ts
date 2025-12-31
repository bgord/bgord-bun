import { describe, expect, spyOn, test } from "bun:test";
import { CryptoAesGcm } from "../src/crypto-aes-gcm.service";
import { EncryptionIV } from "../src/encryption-iv.vo";

const cryptoKey = {} as CryptoKey;

const iv = new Uint8Array(Array.from({ length: 12 }, (_, index) => index + 1));
const plaintext = new Uint8Array([10, 20, 30, 40, 50]);
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encryptedPayload = new Uint8Array(iv.length + ciphertext.length);
encryptedPayload.set(iv, 0);
encryptedPayload.set(ciphertext, iv.length);

describe("AesGcmCrypto", () => {
  test("encrypt", async () => {
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);

    const result = await CryptoAesGcm.encrypt(cryptoKey, plaintext.buffer, iv);

    expect(result).toEqual(encryptedPayload);
  });

  test("decrypt", async () => {
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    const result = await CryptoAesGcm.decrypt(cryptoKey, encryptedPayload);

    expect(new Uint8Array(result)).toEqual(plaintext);
  });

  test("decrypt → invalid payload", async () => {
    const invalidPayload = new Uint8Array(EncryptionIV.LENGTH);

    expect(async () => CryptoAesGcm.decrypt(cryptoKey, invalidPayload)).toThrow(
      "aes.gcm.crypto.invalid.payload",
    );
  });
});
