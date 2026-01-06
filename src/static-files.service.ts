import type * as tools from "@bgord/tools";
import { type Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";

const noop = async () => {};

type StaticFilesStrategy = (path: string, context: Context) => Promise<void> | void;

export const StaticFileStrategyNoop: StaticFilesStrategy = () => {};

export const StaticFileStrategyMustRevalidate: (duration: tools.Duration) => StaticFilesStrategy =
  (duration) => (_, c) => {
    c.header("Cache-Control", `public, max-age=${duration.seconds}, must-revalidate`);
  };

const staticAssetHeaders = secureHeaders({
  crossOriginResourcePolicy: "same-origin",
  crossOriginOpenerPolicy: "same-origin",
  crossOriginEmbedderPolicy: "require-corp",
  referrerPolicy: "no-referrer",
  xContentTypeOptions: "nosniff",
});

const staticDocumentHeaders = secureHeaders({
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
  permissionsPolicy: {
    accelerometer: [],
    autoplay: [],
    camera: [],
    fullscreen: ["self"],
    geolocation: [],
    gyroscope: [],
    magnetometer: [],
    microphone: [],
    payment: [],
    usb: [],
  },
  xFrameOptions: false,
  xXssProtection: false,
});

type StaticFilesOptions = { root?: string };

export class StaticFiles {
  static handle(path: string, strategy: StaticFilesStrategy, options?: StaticFilesOptions) {
    // Stryker disable all
    const root = options?.root ?? "./";
    // Stryker restore all

    return {
      [path]: new Hono().use(
        path,
        async (context, next) => {
          await next();

          const contentType = context.res.headers.get("Content-Type");

          // Stryker disable all
          if (contentType?.startsWith("text/html")) staticDocumentHeaders(context, noop);
          // Stryker restore all
          else staticAssetHeaders(context, noop);
        },
        etag(),
        serveStatic({ root, precompressed: true, onFound: strategy }),
      ).fetch,
    };
  }
}
