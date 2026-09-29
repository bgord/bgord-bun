import type { HasRequestUrl } from "./request-context.port";

export type TrailingSlashResult = { redirect: false } | { redirect: true; pathname: string; status: 308 };

const EDGE_SLASHES = /^\/+|\/+$/g;

export class TrailingSlashMiddleware {
  // RFC 7231 6.4.7 - 308 preserves the request method and body, unlike 301.
  static readonly STATUS = 308;

  evaluate(context: HasRequestUrl): TrailingSlashResult {
    const path = new URL(context.request.url()).pathname;

    if (!path.endsWith("/")) return { redirect: false };
    if (path === "/") return { redirect: false };

    const pathname = `/${path.replace(EDGE_SLASHES, "")}`;

    return { redirect: true, pathname, status: TrailingSlashMiddleware.STATUS };
  }
}
