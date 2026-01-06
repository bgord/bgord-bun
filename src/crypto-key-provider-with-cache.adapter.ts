import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import { CacheSubjectApplicationResolver } from "./cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class CryptoKeyProviderWithCacheAdapter implements CryptoKeyProviderPort {
  constructor(
    private readonly config: { id: string; inner: CryptoKeyProviderPort },
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<CryptoKey> {
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("crypto_key_provider"),
        new CacheSubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<CryptoKey>(subject.hex, () => this.config.inner.get());
  }
}
