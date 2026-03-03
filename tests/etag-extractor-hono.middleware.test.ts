import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import type { ETagVariables } from "../src/etag-extractor-hono.middleware";
import { ETagExtractorHonoMiddleware } from "../src/etag-extractor-hono.middleware";

const middleware = new ETagExtractorHonoMiddleware();
const app = new Hono<{ Variables: ETagVariables }>()
  .use(middleware.handle())
  .get("/ping", (c) => c.json(c.get("ETag")));

describe("ETagExtractorHonoMiddleware", () => {
  test("extracts ETag from valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "12345" }),
    });
    const json = await result.json();

    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("12345");
  });

  test("missing ETag header", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(await result.json()).toEqual(null);
  });

  test("invalid ETag header - NaN", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid ETag header - undefined string", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "undefined" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid ETag header - negative", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "-1" }),
    });

    expect(await result.json()).toEqual(null);
  });
});
