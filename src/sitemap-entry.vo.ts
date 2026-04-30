import type * as tools from "@bgord/tools";
import type { SitemapChangefreqEnum } from "./sitemap-changefreq.vo";
import type { SitemapPriorityType } from "./sitemap-priority.vo";
import type { SitemapUrlType } from "./sitemap-url.vo";

export type SitemapEntryType = {
  loc: SitemapUrlType;
  lastmod?: tools.DayIsoIdType;
  changefreq?: SitemapChangefreqEnum;
  priority?: SitemapPriorityType;
};

export class SitemapEntry {
  constructor(private readonly entry: SitemapEntryType) {}

  toXml(): string {
    const lastmod = this.entry.lastmod ? `<lastmod>${this.entry.lastmod}</lastmod>` : "";

    const changefreq = this.entry.changefreq ? `<changefreq>${this.entry.changefreq}</changefreq>` : "";

    const priority =
      this.entry.priority !== undefined ? `<priority>${this.entry.priority.toFixed(1)}</priority>` : "";

    const loc = `<loc>${this.entry.loc}</loc>`;

    return ["<url>", loc, lastmod, changefreq, priority, "</url>"].join("");
  }
}
