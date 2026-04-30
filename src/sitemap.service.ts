import type { SitemapEntriesProvider } from "./sitemap-entries-provider.port";

export class Sitemap {
  constructor(private readonly providers: ReadonlyArray<SitemapEntriesProvider>) {}

  async toXml(): Promise<string> {
    const resolved = await Promise.all(this.providers.map((provider) => provider.produce()));

    const xmls = resolved.flat().map((entry) => entry.toXml());

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...xmls,
      "</urlset>",
    ].join("");
  }
}
