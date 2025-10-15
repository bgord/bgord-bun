import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import type { EtagVariables } from "../src/etag-extractor.middleware";
import { WeakETagExtractor } from "../src/weak-etag-extractor.middleware";

describe("WeakETagExtractor middleware", () => {
  test("extracts WeakETag from valid header", async () => {
    const app = new Hono<{ Variables: EtagVariables }>()
      .use(WeakETagExtractor.attach)
      .get("/ping", (c) => c.json(c.get("WeakETag")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/12345" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("W/12345");
  });

  test("missing WeakETag header", async () => {
    const app = new Hono<{ Variables: EtagVariables }>()
      .use(WeakETagExtractor.attach)
      .get("/ping", (c) => c.json(c.get("WeakETag")));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });

  test("invalid WeakETag header", async () => {
    const app = new Hono<{ Variables: EtagVariables }>()
      .use(WeakETagExtractor.attach)
      .get("/ping", (c) => c.json(c.get("WeakETag")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });
});
