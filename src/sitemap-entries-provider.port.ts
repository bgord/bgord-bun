import type { SitemapEntry } from "./sitemap-entry.vo";

export interface SitemapEntriesProvider {
  produce(): Promise<ReadonlyArray<SitemapEntry>>;
}
