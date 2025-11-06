import { EncryptionIvValue, type EncryptionIvValueType } from "./encryption-iv-value.vo";

export class EncryptionIV {
  static generate(): EncryptionIvValueType {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    let hex = "";

    for (const byte of iv) {
      const part = byte.toString(16);

      hex += part.length === 1 ? "0" + part : part;
    }

    return EncryptionIvValue.parse(hex);
  }
}
