import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverReadThroughStrategy } from "../src/cache-resolver-read-through.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { Sitemap } from "../src/sitemap.service";
import { SitemapEntriesProviderStaticAdapter } from "../src/sitemap-entries-provider-static.adapter";
import { SitemapEntriesProviderWithCacheAdapter } from "../src/sitemap-entries-provider-with-cache.adapter";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

const url = v.parse(SitemapUrl, "https://example.com");
const entries = [new SitemapEntry({ loc: url })];
const inner = new SitemapEntriesProviderStaticAdapter(entries);

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const id = "id";
const adapter = new SitemapEntriesProviderWithCacheAdapter({ id, inner }, deps);

describe("SitemapEntriesProviderWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    using innerProduce = spyOn(inner, "produce");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");

    const resolver = new SubjectApplicationResolver(
      [new SubjectSegmentFixedStrategy("sitemap_entries_provider"), new SubjectSegmentFixedStrategy(id)],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.produce()).toEqual(entries);
    expect(innerProduce).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      1,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    expect(await adapter.produce()).toEqual(entries);
    expect(innerProduce).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      2,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    jest.advanceTimersByTime(ttl.add(tools.Duration.Minutes(1)).ms);

    expect(await adapter.produce()).toEqual(entries);
    expect(innerProduce).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      3,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    jest.useRealTimers();
  });

  // TODO
  test("a cached entry still produces xml", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });
    const adapter = new SitemapEntriesProviderWithCacheAdapter({ id, inner }, { CacheResolver, HashContent });
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com</loc></url></urlset>';

    expect(await new Sitemap([adapter]).toXml()).toEqual(xml);

    // The second read comes back through the cache, so the entries are rebuilt
    // from their serialized form rather than handed back as live objects.
    expect(await new Sitemap([adapter]).toXml()).toEqual(xml);
  });
});
