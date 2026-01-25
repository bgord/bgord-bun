import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import type { EtagVariables } from "./etag-extractor.middleware";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";

export class WeakETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const context = new RequestContextAdapterHono(c);
      const header = context.request.header(tools.WeakETag.IF_MATCH_HEADER_NAME);

      c.set("WeakETag", tools.WeakETag.fromHeader(header));
    } catch {
      c.set("WeakETag", null);
    }

    await next();
  });
}
