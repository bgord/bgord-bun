import type { HasRequestPath } from "./request-context.port";

export type TrailingSlashResult = { redirect: false } | { redirect: true; pathname: string; status: 308 };

export class TrailingSlashMiddleware {
  // RFC 7231 6.4.7 - 308 preserves the request method and body, unlike 301.
  static readonly STATUS = 308;

  evaluate(context: HasRequestPath): TrailingSlashResult {
    if (!context.request.path.endsWith("/")) return { redirect: false };
    if (context.request.path === "/") return { redirect: false };
    return {
      redirect: true,
      pathname: context.request.path.slice(0, -1),
      status: TrailingSlashMiddleware.STATUS,
    };
  }
}
