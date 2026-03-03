import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import type { ETagVariables } from "../src/etag-extractor-hono.middleware";
import { WeakETagExtractor } from "../src/weak-etag-extractor.middleware";

const app = new Hono<{ Variables: ETagVariables }>()
  .use(WeakETagExtractor.attach)
  .get("/ping", (c) => c.json(c.get("WeakETag")));

describe("WeakETagExtractor middleware", () => {
  test("valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/12345" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("W/12345");
  });

  test("missing header", async () => {
    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });

  test("invalid header - format", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });

  test("invalid header - undefined string", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "undefined" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });

  test("invalid header - negative", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/-1" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });
});
