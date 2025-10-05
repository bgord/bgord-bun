import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheFileMustRevalidate } from "../src/cache-file.service";

const now = tools.Timestamp.parse(1000);

const meta = {
  etag: "abc123etag",
  lastModified: now,
  mime: new tools.Mime("image/webp"),
  size: tools.Size.fromBytes(12345),
};

const lastModified = new Date(meta.lastModified).toUTCString();

describe("CacheFileMustRevalidate", () => {
  test("notModified: 304 with empty body and correct validators", async () => {
    const res = CacheFileMustRevalidate.notModified(meta);
    expect(res.status).toBe(304);

    expect(res.headers.get("ETag")).toBe(meta.etag);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=0, must-revalidate");
    expect(res.headers.get("Vary")).toBe("Authorization, Cookie");
    expect(res.headers.get("Last-Modified")).toBe(lastModified);

    expect(res.headers.get("Content-Type")).toBeNull();
    expect(res.headers.get("Content-Length")).toBeNull();
    expect(res.headers.get("Accept-Ranges")).toBeNull();

    const body = await res.arrayBuffer();
    expect(new Uint8Array(body).length).toBe(0);
  });

  test("notModified: supports overrides", async () => {
    const response = CacheFileMustRevalidate.notModified(meta, {
      "Cache-Control": "no-store",
      "X-Debug": "1",
    });

    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Debug")).toBe("1");

    const body = await response.arrayBuffer();
    expect(new Uint8Array(body).length).toBe(0);
  });

  test("fresh: header set for 200 with correct metadata", () => {
    const headers = CacheFileMustRevalidate.fresh(meta);

    expect(headers.get("Content-Type")).toBe(meta.mime.raw);
    expect(headers.get("Cache-Control")).toBe("private, max-age=0, must-revalidate");
    expect(headers.get("ETag")).toBe(meta.etag);
    expect(headers.get("Content-Length")).toBe(meta.size.toBytes().toString());
    expect(headers.get("Last-Modified")).toBe(lastModified);
    expect(headers.get("Accept-Ranges")).toBe("bytes");
    expect(headers.get("Vary")).toBe("Authorization, Cookie");
  });

  test("fresh: supports overrides", () => {
    const header = CacheFileMustRevalidate.fresh(meta, {
      "Content-Disposition": 'inline; filename="avatar.webp"',
      Vary: "Authorization, Cookie, Accept-Language",
    });

    expect(header.get("Content-Disposition")).toBe('inline; filename="avatar.webp"');
    expect(header.get("Vary")).toBe("Authorization, Cookie, Accept-Language");
    expect(header.get("Last-Modified")).toBe(lastModified);
  });
});
