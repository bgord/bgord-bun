import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type EtagVariables = { ETag: tools.ETag | null; WeakETag: tools.WeakETag | null };

export class ETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (context, next) => {
    try {
      const header = context.req.header(tools.ETag.IF_MATCH_HEADER_NAME);

      context.set("ETag", tools.ETag.fromHeader(header));
    } catch {
      context.set("ETag", null);
    }

    await next();
  });
}
