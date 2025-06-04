import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";

import { ETagExtractor, EtagVariables } from "../src/etag-extractor";

describe("ETagExtractor middleware", () => {
  test("extracts ETag from valid header", async () => {
    const app = new Hono<{ Variables: EtagVariables }>();
    app.use(ETagExtractor.attach);
    app.get("/ping", (c) => c.json(c.get("ETag")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({
        [tools.ETag.IF_MATCH_HEADER_NAME]: "12345",
      }),
    });

    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("12345");
  });

  test("handles missing ETag header gracefully", async () => {
    const app = new Hono<{ Variables: EtagVariables }>();
    app.use(ETagExtractor.attach);
    app.get("/ping", (c) => c.json(c.get("ETag")));

    const result = await app.request("/ping", { method: "GET" });

    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toBeNull();
  });

  test("handles invalid ETag header gracefully", async () => {
    const app = new Hono<{ Variables: EtagVariables }>();
    app.use(ETagExtractor.attach);
    app.get("/ping", (c) => c.json(c.get("ETag")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({
        [tools.ETag.IF_MATCH_HEADER_NAME]: "invalid",
      }),
    });

    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toBeNull();
  });
});
