import type { SitemapEntriesProvider } from "./sitemap-entries-provider.port";
import type { SitemapEntry } from "./sitemap-entry.vo";

export class SitemapEntriesProviderStaticAdapter implements SitemapEntriesProvider {
  constructor(private readonly entries: ReadonlyArray<SitemapEntry>) {}

  async produce(): Promise<ReadonlyArray<SitemapEntry>> {
    return this.entries;
  }
}
