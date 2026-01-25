import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";

export type EtagVariables = { ETag: tools.ETag | null; WeakETag: tools.WeakETag | null };

export class ETagExtractor {
  static attach = createMiddleware<{ Variables: EtagVariables }>(async (c, next) => {
    try {
      const context = new RequestContextAdapterHono(c);
      const header = context.request.header(tools.ETag.IF_MATCH_HEADER_NAME);

      c.set("ETag", tools.ETag.fromHeader(header));
    } catch {
      c.set("ETag", null);
    }

    await next();
  });
}
