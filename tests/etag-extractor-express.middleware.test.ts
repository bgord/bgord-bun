import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ETagExtractorExpressMiddleware } from "../src/etag-extractor-express.middleware";

const middleware = new ETagExtractorExpressMiddleware();
const app = express()
  .use(middleware.handle())
  .get("/ping", (req, res) => res.json(req.ETag));

describe("ETagExtractorExpressMiddleware", () => {
  test("valid header", async () => {
    const result = await request(app).get("/ping").set(tools.ETag.IF_MATCH_HEADER_NAME, "12345");

    expect(result.body.revision).toEqual(12345);
    expect(result.body.value).toEqual("12345");
  });

  test("missing header", async () => {
    const result = await request(app).get("/ping");

    expect(result.body).toEqual(null);
  });

  test("invalid header - NaN", async () => {
    const result = await request(app).get("/ping").set(tools.ETag.IF_MATCH_HEADER_NAME, "invalid");

    expect(result.body).toEqual(null);
  });

  test("invalid header - undefined string", async () => {
    const result = await request(app).get("/ping").set(tools.ETag.IF_MATCH_HEADER_NAME, "undefined");

    expect(result.body).toEqual(null);
  });

  test("invalid header - negative", async () => {
    const result = await request(app).get("/ping").set(tools.ETag.IF_MATCH_HEADER_NAME, "-1");

    expect(result.body).toEqual(null);
  });
});
