import { EncryptionKeyValue, type EncryptionKeyValueType } from "./encryption-key-value.vo";

export const EncryptionKeyError = { InvalidBuffer: "encryption.key.invalid.buffer" };

export class EncryptionKey {
  private constructor(private readonly key: EncryptionKeyValueType) {}

  static fromStringSafe(value: EncryptionKeyValueType): EncryptionKey {
    return new EncryptionKey(value);
  }

  static fromString(candidate: string): EncryptionKey {
    return new EncryptionKey(EncryptionKeyValue.parse(candidate));
  }

  static fromBytes(buffer: Uint8Array): EncryptionKey {
    if (buffer.length !== 32) throw new Error(EncryptionKeyError.InvalidBuffer);

    return EncryptionKey.fromString(buffer.toHex());
  }

  equals(another: EncryptionKey): boolean {
    return this.key === another.key;
  }

  toBytes(): Uint8Array {
    return Uint8Array.fromHex(this.key);
  }

  toString(): string {
    return "EncryptionKey";
  }

  toJSON(): string {
    return "EncryptionKey";
  }
}
