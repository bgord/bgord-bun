import type { HasRequestPath } from "./request-context.port";

export type TrailingSlashResult = { redirect: false } | { redirect: true; pathname: string };

export class TrailingSlashMiddleware {
  evaluate(context: HasRequestPath): TrailingSlashResult {
    if (!context.request.path.endsWith("/")) return { redirect: false };
    if (context.request.path === "/") return { redirect: false };
    return { redirect: true, pathname: context.request.path.slice(0, -1) };
  }
}
