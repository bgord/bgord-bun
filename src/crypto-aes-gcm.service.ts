export const CryptoAesGcmError = { InvalidPayload: "aes.gcm.crypto.invalid.payload" };

export class CryptoAesGcm {
  static readonly ALGORITHM = "AES-GCM";
  static readonly IV_LENGTH = 12;

  static async encrypt(key: CryptoKey, plaintext: ArrayBuffer, iv: Uint8Array): Promise<Uint8Array> {
    const encrypted = await crypto.subtle.encrypt(
      { name: CryptoAesGcm.ALGORITHM, iv: iv.buffer as BufferSource },
      key,
      plaintext,
    );

    const ciphertext = new Uint8Array(encrypted);
    const output = new Uint8Array(iv.length + ciphertext.length);

    output.set(iv, 0);
    output.set(ciphertext, iv.length);

    return output;
  }

  static async decrypt(key: CryptoKey, payload: Uint8Array): Promise<ArrayBuffer> {
    if (payload.length < CryptoAesGcm.IV_LENGTH + 1) throw new Error(CryptoAesGcmError.InvalidPayload);

    const iv = payload.subarray(0, CryptoAesGcm.IV_LENGTH);
    const ciphertext = payload.subarray(CryptoAesGcm.IV_LENGTH);

    return crypto.subtle.decrypt(
      { name: CryptoAesGcm.ALGORITHM, iv: iv.buffer as BufferSource },
      key,
      ciphertext.buffer as BufferSource,
    );
  }
}
