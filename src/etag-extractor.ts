import { createMiddleware } from "hono/factory";

export type EtagVariables = {
  ETag: bg.ETag | null;
  WeakETag: bg.WeakETag | null;
};

export class ETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const header = String(c.req.header(bg.ETag.IF_MATCH_HEADER_NAME));

      if (!header || header === "undefined") c.set("ETag", null);
      else c.set("ETag", bg.ETag.fromHeader(header));
    } catch (error) {
      c.set("ETag", null);
    }

    await next();
  });
}

export class WeakETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const header = String(c.req.header(bg.WeakETag.IF_MATCH_HEADER_NAME));

      if (!header || header === "undefined") c.set("WeakETag", null);
      else c.set("WeakETag", bg.WeakETag.fromHeader(header));
    } catch (error) {
      c.set("WeakETag", null);
    }

    await next();
  });
}
