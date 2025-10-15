import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ETagExtractor, type EtagVariables } from "../src/etag-extractor.middleware";

const app = new Hono<{ Variables: EtagVariables }>()
  .use(ETagExtractor.attach)
  .get("/ping", (c) => c.json(c.get("ETag")));

describe("ETagExtractor middleware", () => {
  test("extracts ETag from valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "12345" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json.revision).toEqual(12345);
    expect(json.value).toEqual("12345");
  });

  test("missing ETag header", async () => {
    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });

  test("invalid ETag header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "invalid" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual(null);
  });
});
