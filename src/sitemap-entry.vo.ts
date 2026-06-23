// cspell:ignore apos
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

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  toXml(): string {
    const loc = `<loc>${this.escapeXml(this.entry.loc)}</loc>`;
    const lastmod = this.entry.lastmod ? `<lastmod>${this.entry.lastmod}</lastmod>` : "";
    const changefreq = this.entry.changefreq ? `<changefreq>${this.entry.changefreq}</changefreq>` : "";
    const priority =
      this.entry.priority !== undefined ? `<priority>${this.entry.priority.toFixed(1)}</priority>` : "";

    return ["<url>", loc, lastmod, changefreq, priority, "</url>"].join("");
  }
}
