import * as tools from "@bgord/tools";
import { type Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";

type StaticFilesStrategy = (path: string, context: Context) => Promise<void> | void;

export const StaticFileStrategyNoop: StaticFilesStrategy = () => {};

export const StaticFileStrategyMustRevalidate: (duration: tools.Duration) => StaticFilesStrategy =
  (duration) => (_, c) => {
    c.header("Cache-Control", `public, max-age=${duration.seconds}, must-revalidate`);
  };

type StaticFilesOptions = { root?: string };

const staticAssetHeaders = secureHeaders({
  strictTransportSecurity: `max-age=${tools.Duration.Days(180).seconds}; includeSubDomains`,
  crossOriginResourcePolicy: "same-origin",
  crossOriginOpenerPolicy: "same-origin",
  crossOriginEmbedderPolicy: "require-corp",
  referrerPolicy: "no-referrer",
  xContentTypeOptions: "nosniff",
});

const staticDocumentHeaders = secureHeaders({
  strictTransportSecurity: `max-age=${tools.Duration.Days(180).seconds}; includeSubDomains`,
  crossOriginResourcePolicy: "same-origin",
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    baseUri: ["'none'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'"],
    fontSrc: ["'self'"],
    mediaSrc: ["'self'"],
    connectSrc: ["'self'"],
    formAction: ["'self'"],
  },
});

export class StaticFiles {
  static handle(path: string, strategy: StaticFilesStrategy, options?: StaticFilesOptions) {
    const root = options?.root ?? "./";

    return {
      [path]: new Hono().use(
        path,
        async (context, next) => {
          await next();

          if (!context.res) return;

          const noop = async () => {};
          const contentType = context.res.headers.get("Content-Type") ?? "";

          if (contentType.startsWith("text/html")) {
            staticDocumentHeaders(context, noop);
          } else {
            staticAssetHeaders(context, noop);
          }
        },
        etag(),
        serveStatic({ root, precompressed: true, onFound: strategy }),
      ).fetch,
    };
  }
}
