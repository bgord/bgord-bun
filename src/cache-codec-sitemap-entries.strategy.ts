import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { CacheValueType } from "./cache-value.vo";
import { SitemapEntry } from "./sitemap-entry.vo";

export const CacheCodecSitemapEntriesError = { NotAnArray: "cache.codec.sitemap.entries.not.an.array" };

export class CacheCodecSitemapEntriesStrategy implements CacheCodecStrategy<ReadonlyArray<SitemapEntry>> {
  encode(value: ReadonlyArray<SitemapEntry>): CacheValueType {
    return value.map((entry) => entry.toJSON());
  }

  decode(raw: CacheValueType): ReadonlyArray<SitemapEntry> {
    if (!Array.isArray(raw)) throw new Error(CacheCodecSitemapEntriesError.NotAnArray);

    return raw.map((entry) => SitemapEntry.fromJSON(entry));
  }
}
