import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

type Config = { id: string; inner: CryptoKeyProviderPort };

export class CryptoKeyProviderWithCacheAdapter implements CryptoKeyProviderPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<CryptoKey> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("crypto_key_provider"),
        new SubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<CryptoKey>(subject.hex, () => this.config.inner.get());
  }
}
