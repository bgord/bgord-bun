import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import type { ETagVariables } from "../src/etag-extractor-hono.middleware";
import { ETagExtractorHonoMiddleware } from "../src/etag-extractor-hono.middleware";

type Config = { Variables: ETagVariables };

const middleware = new ETagExtractorHonoMiddleware();
const app = new Hono<Config>().use(middleware.handle()).get("/ping", (c) => c.json(c.get("ETag")));

describe("ETagExtractorHonoMiddleware", () => {
  test("valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "12345" }),
    });
    const json = await result.json();

    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("12345");
  });

  test("missing header", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - NaN", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - undefined string", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "undefined" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - negative", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "-1" }),
    });

    expect(await result.json()).toEqual(null);
  });
});
