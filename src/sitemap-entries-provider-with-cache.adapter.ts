import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { SitemapEntriesProvider } from "./sitemap-entries-provider.port";
import type { SitemapEntry } from "./sitemap-entry.vo";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Config = { id: string; inner: SitemapEntriesProvider };
type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class SitemapEntriesProviderWithCacheAdapter implements SitemapEntriesProvider {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async produce(): Promise<ReadonlyArray<SitemapEntry>> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("sitemap_entries_provider"),
        new SubjectSegmentFixedStrategy(this.config.id),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<ReadonlyArray<SitemapEntry>>(subject.hex, () =>
      this.config.inner.produce(),
    );
  }
}
