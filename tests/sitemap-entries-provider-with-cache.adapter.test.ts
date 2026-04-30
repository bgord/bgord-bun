import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
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
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
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
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await adapter.produce()).toEqual(entries);
    expect(innerProduce).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    jest.advanceTimersByTime(ttl.add(tools.Duration.Minutes(1)).ms);

    expect(await adapter.produce()).toEqual(entries);
    expect(innerProduce).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(3, subject.hex, expect.any(Function));

    jest.useRealTimers();
  });
});
