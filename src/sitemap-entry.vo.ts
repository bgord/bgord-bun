// cspell:ignore apos
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { SitemapChangefreqEnum } from "./sitemap-changefreq.vo";
import { SitemapPriority } from "./sitemap-priority.vo";
import { SitemapUrl } from "./sitemap-url.vo";
import { StandardSchemaValidator } from "./standard-schema-validator.service";

export const SitemapEntrySchema = v.object({
  loc: SitemapUrl,
  lastmod: v.optional(tools.DayIsoId),
  changefreq: v.optional(v.enum(SitemapChangefreqEnum)),
  priority: v.optional(SitemapPriority),
});

export type SitemapEntryType = v.InferOutput<typeof SitemapEntrySchema>;

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

  static fromJSON(raw: unknown): SitemapEntry {
    return new SitemapEntry(StandardSchemaValidator.validate(SitemapEntrySchema, raw));
  }

  toJSON(): SitemapEntryType {
    return { ...this.entry };
  }

  toXml(): string {
    const loc = `<loc>${this.escapeXml(this.entry.loc)}</loc>`;
    const lastmod = this.entry.lastmod ? `<lastmod>${this.entry.lastmod}</lastmod>` : "";
    const changefreq = this.entry.changefreq ? `<changefreq>${this.entry.changefreq}</changefreq>` : "";
    const priority =
      this.entry.priority !== undefined ? `<priority>${this.entry.priority.toFixed(2)}</priority>` : "";

    return ["<url>", loc, lastmod, changefreq, priority, "</url>"].join("");
  }
}
