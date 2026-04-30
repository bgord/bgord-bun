import type { SitemapEntriesProvider } from "./sitemap-entries-provider.port";
import type { SitemapEntry } from "./sitemap-entry.vo";

type Config<T> = { fetcher: () => Promise<ReadonlyArray<T>>; mapper: (item: T) => SitemapEntry };

export class SitemapEntriesProviderDynamicAdapter<T> implements SitemapEntriesProvider {
  constructor(private readonly config: Config<T>) {}

  async produce(): Promise<ReadonlyArray<SitemapEntry>> {
    const items = await this.config.fetcher();

    return items.map(this.config.mapper);
  }
}
