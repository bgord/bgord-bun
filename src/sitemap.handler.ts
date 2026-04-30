import type { Sitemap } from "./sitemap.service";

type SitemapHandlerConfig = { sitemap: Sitemap };

export class SitemapHandler {
  constructor(private readonly config: SitemapHandlerConfig) {}

  async generate(): Promise<string> {
    return this.config.sitemap.toXml();
  }
}
