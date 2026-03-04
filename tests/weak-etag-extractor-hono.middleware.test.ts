import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import {
  WeakETagExtractorHonoMiddleware,
  type WeakETagVariables,
} from "../src/weak-etag-extractor-hono.middleware";

type Config = { Variables: WeakETagVariables };

const app = new Hono<Config>()
  .use(new WeakETagExtractorHonoMiddleware().handle())
  .get("/ping", (c) => c.json(c.get("WeakETag")));

describe("WeakETagExtractorHonoMiddleware", () => {
  test("valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/12345" }),
    });
    const json = await result.json();

    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("W/12345");
  });

  test("missing header", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - format", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - undefined string", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "undefined" }),
    });

    expect(await result.json()).toEqual(null);
  });

  test("invalid header - negative", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/-1" }),
    });

    expect(await result.json()).toEqual(null);
  });
});
