import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ShieldApiKeyStrategy } from "../src/shield-api-key.strategy";
import { ShieldApiKeyExpressStrategy } from "../src/shield-api-key-express.strategy";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const shield = new ShieldApiKeyExpressStrategy({ API_KEY: tools.ApiKey.parse(VALID_API_KEY) });

const app = express()
  .use(shield.handle())
  .get("/ping", (_request, response) => response.send("OK"));

describe("ShieldApiKeyExpressStrategy", () => {
  test("happy path", async () => {
    const result = await request(app).get("/ping").set(ShieldApiKeyStrategy.HEADER_NAME, VALID_API_KEY);

    expect(result.status).toEqual(200);
  });

  test("denied - no api key", async () => {
    const result = await request(app).get("/ping").set(ShieldApiKeyStrategy.HEADER_NAME, "");

    expect(result.status).toEqual(403);
    expect(result.body.message).toEqual("shield.api.key.rejected");
  });

  test("denied - invalid api key", async () => {
    const result = await request(app).get("/ping").set(ShieldApiKeyStrategy.HEADER_NAME, INVALID_API_KEY);

    expect(result.status).toEqual(403);
    expect(result.body.message).toEqual("shield.api.key.rejected");
  });
});
