import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";

export class CryptoKeyProviderNoopAdapter implements CryptoKeyProviderPort {
  async get(): Promise<CryptoKey> {
    const bytes = new Uint8Array(32);

    return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }
}
