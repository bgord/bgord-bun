import type { HashFileResult } from "./hash-file.port";

type CacheFileOverridesType = Record<string, string>;

interface CacheFileHandler {
  notModified(options: HashFileResult, overrides?: CacheFileOverridesType): Response;

  fresh(options: HashFileResult, overrides?: CacheFileOverridesType): Headers;
}

export const CacheFileMustRevalidate: CacheFileHandler = {
  notModified(options: HashFileResult, overrides: CacheFileOverridesType = {}) {
    return new Response(null, {
      status: 304,
      headers: new Headers({
        ETag: options.etag.get(),
        "Cache-Control": "private, max-age=0, must-revalidate",
        "Last-Modified": new Date(options.lastModified.ms).toUTCString(),
        Vary: "Authorization, Cookie",
        ...overrides,
      }),
    });
  },

  fresh(options: HashFileResult, overrides: CacheFileOverridesType = {}) {
    return new Headers({
      "Content-Type": options.mime.toString(),
      "Cache-Control": "private, max-age=0, must-revalidate",
      ETag: options.etag.get(),
      "Content-Length": options.size.toBytes().toString(),
      "Last-Modified": new Date(options.lastModified.ms).toUTCString(),
      "Accept-Ranges": "bytes",
      Vary: "Authorization, Cookie",
      ...overrides,
    });
  },
};
