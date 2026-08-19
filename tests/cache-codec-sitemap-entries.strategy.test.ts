import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { CacheCodecSitemapEntriesStrategy } from "../src/cache-codec-sitemap-entries.strategy";
import { SitemapEntry } from "../src/sitemap-entry.vo";
import { SitemapUrl } from "../src/sitemap-url.vo";

const loc = v.parse(SitemapUrl, "https://example.com");

describe("CacheCodecSitemapEntriesStrategy", () => {
  test("encode", () => {
    const codec = new CacheCodecSitemapEntriesStrategy();

    expect(codec.encode([new SitemapEntry({ loc })])).toEqual([{ loc: "https://example.com" }]);
  });

  test("decode", () => {
    const codec = new CacheCodecSitemapEntriesStrategy();

    const decoded = codec.decode([{ loc: "https://example.com" }]);

    expect(decoded[0]?.toXml()).toEqual("<url><loc>https://example.com</loc></url>");
  });

  test("decode - not an array", () => {
    expect(() => new CacheCodecSitemapEntriesStrategy().decode({ loc: "https://example.com" })).toThrow(
      "cache.codec.sitemap.entries.not.an.array",
    );
  });

  test("round trip", () => {
    const codec = new CacheCodecSitemapEntriesStrategy();
    const entries = [new SitemapEntry({ loc })];

    const decoded = codec.decode(JSON.parse(JSON.stringify(codec.encode(entries))));

    expect(decoded[0]?.toXml()).toEqual(entries[0]?.toXml());
  });

  test("round trip - empty", () => {
    const codec = new CacheCodecSitemapEntriesStrategy();

    expect(codec.encode([])).toEqual([]);
    expect(codec.decode([])).toEqual([]);
  });
});
