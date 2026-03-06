import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { WeakETagExtractorExpressMiddleware } from "../src/weak-etag-extractor-express.middleware";

const app = express()
  .use(new WeakETagExtractorExpressMiddleware().handle())
  .get("/ping", (req, res) => res.json(req.WeakETag));

describe("WeakETagExtractorExpressMiddleware", () => {
  test("valid header", async () => {
    const result = await request(app).get("/ping").set(tools.WeakETag.IF_MATCH_HEADER_NAME, "W/12345");

    expect(result.body.revision).toEqual(12345);
    expect(result.body.value).toEqual("W/12345");
  });

  test("missing header", async () => {
    const result = await request(app).get("/ping");

    expect(result.body).toEqual(null);
  });

  test("invalid header - format", async () => {
    const result = await request(app).get("/ping").set(tools.WeakETag.IF_MATCH_HEADER_NAME, "invalid");

    expect(result.body).toEqual(null);
  });

  test("invalid header - undefined string", async () => {
    const result = await request(app).get("/ping").set(tools.WeakETag.IF_MATCH_HEADER_NAME, "undefined");

    expect(result.body).toEqual(null);
  });

  test("invalid header - negative", async () => {
    const result = await request(app).get("/ping").set(tools.WeakETag.IF_MATCH_HEADER_NAME, "W/-1");

    expect(result.body).toEqual(null);
  });
});
