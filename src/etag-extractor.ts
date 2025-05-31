import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type EtagVariables = {
  ETag: tools.ETag | null;
  WeakETag: tools.WeakETag | null;
};

export class ETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const header = String(c.req.header(tools.ETag.IF_MATCH_HEADER_NAME));

      if (!header || header === "undefined") c.set("ETag", null);
      else c.set("ETag", tools.ETag.fromHeader(header));
    } catch (error) {
      c.set("ETag", null);
    }

    await next();
  });
}

export class WeakETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const header = String(c.req.header(tools.WeakETag.IF_MATCH_HEADER_NAME));

      if (!header || header === "undefined") c.set("WeakETag", null);
      else c.set("WeakETag", tools.WeakETag.fromHeader(header));
    } catch (error) {
      c.set("WeakETag", null);
    }

    await next();
  });
}
