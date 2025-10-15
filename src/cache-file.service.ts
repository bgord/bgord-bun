import type { FileHashResult } from "./file-hash.port";

type CacheFileOverridesType = Record<string, string>;

interface CacheFileHandler {
  notModified(options: FileHashResult, overrides?: CacheFileOverridesType): Response;

  fresh(options: FileHashResult, overrides?: CacheFileOverridesType): Headers;
}

export const CacheFileMustRevalidate: CacheFileHandler = {
  notModified(options: FileHashResult, overrides: CacheFileOverridesType = {}) {
    return new Response(null, {
      status: 304,
      headers: new Headers({
        ETag: options.etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
        "Last-Modified": new Date(options.lastModified).toUTCString(),
        Vary: "Authorization, Cookie",
        ...overrides,
      }),
    });
  },

  fresh(options: FileHashResult, overrides: CacheFileOverridesType = {}) {
    return new Headers({
      "Content-Type": options.mime.toString(),
      "Cache-Control": "private, max-age=0, must-revalidate",
      ETag: options.etag,
      "Content-Length": options.size.toBytes().toString(),
      "Last-Modified": new Date(options.lastModified).toUTCString(),
      "Accept-Ranges": "bytes",
      Vary: "Authorization, Cookie",
      ...overrides,
    });
  },
};
