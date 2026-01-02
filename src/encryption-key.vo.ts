import { EncryptionKeyValue, type EncryptionKeyValueType } from "./encryption-key-value.vo";

export const EncryptionKeyError = { InvalidBuffer: "encryption.key.invalid.buffer" };

export class EncryptionKey {
  private constructor(private readonly value: EncryptionKeyValueType) {}

  static fromStringSafe(value: EncryptionKeyValueType): EncryptionKey {
    return new EncryptionKey(value);
  }

  static fromString(candidate: string): EncryptionKey {
    return new EncryptionKey(EncryptionKeyValue.parse(candidate));
  }

  static fromBuffer(buffer: Uint8Array): EncryptionKey {
    if (buffer.length !== 32) throw new Error(EncryptionKeyError.InvalidBuffer);

    const hex = Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return EncryptionKey.fromString(hex);
  }

  equals(another: EncryptionKey): boolean {
    return this.value === another.value;
  }

  toBuffer(): Uint8Array {
    return Uint8Array.from(Buffer.from(this.value, "hex"));
  }

  toString(): string {
    return "EncryptionKey";
  }

  toJSON(): string {
    return "EncryptionKey";
  }
}
