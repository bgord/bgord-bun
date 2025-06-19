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
    } catch (_error) {
      c.set("ETag", null);
    }

    await next();
  });
}
