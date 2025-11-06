import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionKeyType } from "./encryption-key.vo";

export class CryptoKeyProviderEnvAdapter implements CryptoKeyProviderPort {
  constructor(private readonly ENCRYPTION_KEY: EncryptionKeyType) {}

  async get(): Promise<CryptoKey> {
    const bytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
      bytes[i] = Number.parseInt(this.ENCRYPTION_KEY.slice(i * 2, i * 2 + 2), 16);
    }

    return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }
}
