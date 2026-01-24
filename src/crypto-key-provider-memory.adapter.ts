import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import { EncryptionKey } from "./encryption-key.vo";
import type { EncryptionKeyValueType } from "./encryption-key-value.vo";

export class CryptoKeyProviderMemoryAdapter implements CryptoKeyProviderPort {
  constructor(private readonly ENCRYPTION_KEY_VALUE: EncryptionKeyValueType) {}

  async get(): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      "raw",
      EncryptionKey.fromString(this.ENCRYPTION_KEY_VALUE).toBytes() as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  }
}
