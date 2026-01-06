import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import type { EtagVariables } from "./etag-extractor.middleware";

export class WeakETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (context, next) => {
    try {
      const header = context.req.header(tools.WeakETag.IF_MATCH_HEADER_NAME);

      context.set("WeakETag", tools.WeakETag.fromHeader(header));
    } catch {
      context.set("WeakETag", null);
    }

    await next();
  });
}
