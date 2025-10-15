import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import type { EtagVariables } from "./etag-extractor.middleware";

export class WeakETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const header = c.req.header(tools.WeakETag.IF_MATCH_HEADER_NAME);

      if (!header || header === "undefined") c.set("WeakETag", null);
      else c.set("WeakETag", tools.WeakETag.fromHeader(header));
    } catch {
      c.set("WeakETag", null);
    }

    await next();
  });
}
