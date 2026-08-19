import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";

type Config = { inner: CryptoKeyProviderPort };

export class CryptoKeyProviderWithMemoAdapter implements CryptoKeyProviderPort {
  private memoized: Promise<CryptoKey> | null = null;

  constructor(private readonly config: Config) {}

  async get(): Promise<CryptoKey> {
    if (this.memoized === null) this.memoized = this.config.inner.get();

    return this.memoized;
  }
}
