import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";

export class CryptoKeyProviderEnv implements CryptoKeyProviderPort {
  async get(): Promise<CryptoKey> {}
}
