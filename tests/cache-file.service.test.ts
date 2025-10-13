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
    expect(res.status).toEqual(304);

    expect(res.headers.get("ETag")).toEqual(meta.etag);
    expect(res.headers.get("Cache-Control")).toEqual("private, max-age=0, must-revalidate");
    expect(res.headers.get("Vary")).toEqual("Authorization, Cookie");
    expect(res.headers.get("Last-Modified")).toEqual(lastModified);

    expect(res.headers.get("Content-Type")).toEqual(null);
    expect(res.headers.get("Content-Length")).toEqual(null);
    expect(res.headers.get("Accept-Ranges")).toEqual(null);

    const body = await res.arrayBuffer();
    expect(new Uint8Array(body).length).toEqual(0);
  });

  test("notModified: supports overrides", async () => {
    const response = CacheFileMustRevalidate.notModified(meta, {
      "Cache-Control": "no-store",
      "X-Debug": "1",
    });

    expect(response.headers.get("Cache-Control")).toEqual("no-store");
    expect(response.headers.get("X-Debug")).toEqual("1");

    const body = await response.arrayBuffer();
    expect(new Uint8Array(body).length).toEqual(0);
  });

  test("fresh: header set for 200 with correct metadata", () => {
    const headers = CacheFileMustRevalidate.fresh(meta);

    expect(headers.get("Content-Type")).toEqual(meta.mime.toString());
    expect(headers.get("Cache-Control")).toEqual("private, max-age=0, must-revalidate");
    expect(headers.get("ETag")).toEqual(meta.etag);
    expect(headers.get("Content-Length")).toEqual(meta.size.toBytes().toString());
    expect(headers.get("Last-Modified")).toEqual(lastModified);
    expect(headers.get("Accept-Ranges")).toEqual("bytes");
    expect(headers.get("Vary")).toEqual("Authorization, Cookie");
  });

  test("fresh: supports overrides", () => {
    const header = CacheFileMustRevalidate.fresh(meta, {
      "Content-Disposition": 'inline; filename="avatar.webp"',
      Vary: "Authorization, Cookie, Accept-Language",
    });

    expect(header.get("Content-Disposition")).toEqual('inline; filename="avatar.webp"');
    expect(header.get("Vary")).toEqual("Authorization, Cookie, Accept-Language");
    expect(header.get("Last-Modified")).toEqual(lastModified);
  });
});
