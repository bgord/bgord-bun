import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import { SitemapHandler, type SitemapHandlerConfig } from "./sitemap.handler";

const factory = createFactory();

export class SitemapHonoHandler implements HandlerHonoPort {
  private readonly handler: SitemapHandler;

  constructor(config: SitemapHandlerConfig) {
    this.handler = new SitemapHandler(config);
  }

  handle() {
    return factory.createHandlers(async (c) => {
      const xml = await this.handler.generate();

      c.header("Content-Type", "application/xml");
      return c.body(xml, 200);
    });
  }
}
