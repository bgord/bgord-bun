import { describe, expect, spyOn, test } from "bun:test";
import { CryptoAesGcm } from "../src/crypto-aes-gcm.service";
import { EncryptionIV } from "../src/encryption-iv.vo";

const cryptoKey = {} as CryptoKey;

const iv = new Uint8Array(Array.from({ length: 12 }, (_, index) => index + 1));

const plaintext = new Uint8Array([10, 20, 30, 40, 50]);
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encryptedBytes = new Uint8Array(iv.length + ciphertext.length);
encryptedBytes.set(iv, 0);
encryptedBytes.set(ciphertext, iv.length);

describe("AesGcmCrypto", () => {
  test("encrypt", async () => {
    const cryptoSubtleEncrypt = spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);

    const result = await CryptoAesGcm.encrypt(cryptoKey, plaintext.buffer, iv);

    expect(result).toEqual(encryptedBytes);
    expect(cryptoSubtleEncrypt).toHaveBeenCalledWith(
      { name: "AES-GCM", iv: expect.any(Uint8Array) },
      cryptoKey,
      plaintext.buffer,
    );
  });

  test("decrypt", async () => {
    const cryptoSubtleDecrypt = spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    const result = await CryptoAesGcm.decrypt(cryptoKey, encryptedBytes);

    expect(new Uint8Array(result)).toEqual(plaintext);
    expect(cryptoSubtleDecrypt).toHaveBeenCalledWith(
      { name: "AES-GCM", iv: expect.any(Uint8Array) },
      cryptoKey,
      expect.any(Uint8Array),
    );
  });

  test("decrypt - invalid payload", async () => {
    expect(async () => CryptoAesGcm.decrypt(cryptoKey, new Uint8Array(EncryptionIV.LENGTH))).toThrow(
      "aes.gcm.crypto.invalid.payload",
    );
  });

  test("decrypt - minimum valid payload", async () => {
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(new ArrayBuffer(1));

    expect(async () =>
      CryptoAesGcm.decrypt(cryptoKey, new Uint8Array(EncryptionIV.LENGTH + 1)),
    ).not.toThrow();
  });
});
