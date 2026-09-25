// [BUN DEPENDENCY]
// cspell:ignore nosniff
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";
import type { CacheControlStrategy } from "./cache-control.strategy";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

const noop = async () => {};

const staticAssetHeaders = secureHeaders({
  crossOriginResourcePolicy: "same-origin",
  crossOriginOpenerPolicy: "same-origin",
  crossOriginEmbedderPolicy: "require-corp",
  referrerPolicy: "no-referrer",
  xContentTypeOptions: "nosniff",
  xFrameOptions: false,
  xXssProtection: false,
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

export class StaticFilesHono {
  static handle(path: string, strategy: CacheControlStrategy, options?: StaticFilesOptions) {
    // Stryker disable all
    const root = options?.root ?? "./";
    // Stryker restore all

    return {
      [path]: new Hono().use(
        path,
        async (context, next) => {
          await next();

          const contentType = context.res.headers.get("Content-Type");

          if (contentType?.startsWith("text/html")) await staticDocumentHeaders(context, noop);
          else await staticAssetHeaders(context, noop);
        },
        etag(),
        serveStatic({
          root,
          precompressed: true,
          onFound: (_, context) => {
            const value = strategy.resolve(new RequestContextHonoAdapter(context));

            if (value) context.header("Cache-Control", value);
          },
        }),
      ).fetch,
    };
  }
}
