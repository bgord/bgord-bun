import type { HasRequestPath } from "./request-context.port";

export type TrailingSlashResult = { redirect: false } | { redirect: true; pathname: string; status: 308 };

const TRAILING_SLASHES = /\/+$/;
const LEADING_SLASHES = /^\/+/;

export class TrailingSlashMiddleware {
  // RFC 7231 6.4.7 - 308 preserves the request method and body, unlike 301.
  static readonly STATUS = 308;

  evaluate(context: HasRequestPath): TrailingSlashResult {
    if (!context.request.path.endsWith("/")) return { redirect: false };
    if (context.request.path === "/") return { redirect: false };

    const pathname = (context.request.path.replace(TRAILING_SLASHES, "") || "/").replace(
      LEADING_SLASHES,
      "/",
    );

    return { redirect: true, pathname, status: TrailingSlashMiddleware.STATUS };
  }
}
