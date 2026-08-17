// cspell:ignore ciphertext
import { EncryptionIV } from "./encryption-iv.vo";

export const CryptoAesGcmError = { InvalidPayload: "aes.gcm.crypto.invalid.payload" };

export class CryptoAesGcm {
  static readonly ALGORITHM = "AES-GCM";

  static async encrypt(
    key: CryptoKey,
    plaintext: ArrayBuffer,
    iv: Uint8Array<ArrayBuffer>,
  ): Promise<Uint8Array> {
    const encrypted = await crypto.subtle.encrypt({ name: CryptoAesGcm.ALGORITHM, iv }, key, plaintext);

    const ciphertext = new Uint8Array(encrypted);
    const output = new Uint8Array(iv.length + ciphertext.length);

    output.set(iv, 0);
    output.set(ciphertext, iv.length);

    return output;
  }

  static async decrypt(key: CryptoKey, payload: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
    if (payload.length < EncryptionIV.LENGTH + 1) throw new Error(CryptoAesGcmError.InvalidPayload);

    const iv = payload.subarray(0, EncryptionIV.LENGTH);
    const ciphertext = payload.subarray(EncryptionIV.LENGTH);

    return crypto.subtle.decrypt({ name: CryptoAesGcm.ALGORITHM, iv }, key, ciphertext);
  }
}
