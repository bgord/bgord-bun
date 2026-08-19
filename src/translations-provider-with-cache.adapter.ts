import type * as tools from "@bgord/tools";
import { CacheCodecIdentityStrategy } from "./cache-codec-identity.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";
import type { TranslationsProviderPort, TranslationsType } from "./translations-provider.port";

type Config = { id: string; inner: TranslationsProviderPort };
type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class TranslationsProviderWithCacheAdapter implements TranslationsProviderPort {
  private readonly codec = new CacheCodecIdentityStrategy<TranslationsType>();

  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("translations_provider"),
        new SubjectSegmentFixedStrategy(this.config.id),
        new SubjectSegmentFixedStrategy(language),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<TranslationsType>(
      subject.hex,
      async () => this.config.inner.getTranslationsFor(language),
      this.codec,
    );
  }
}
