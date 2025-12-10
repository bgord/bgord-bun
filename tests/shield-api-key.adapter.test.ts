import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldApiKeyAdapter } from "../src/shield-api-key.adapter";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const apiKeyShield = new ShieldApiKeyAdapter({ API_KEY: tools.ApiKey.parse(VALID_API_KEY) });

describe("ShieldApiKey middleware", () => {
  test("happy path", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyAdapter.HEADER_NAME]: VALID_API_KEY }),
    });

    expect(result.status).toEqual(200);
  });

  test("denied - no api key", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyAdapter.HEADER_NAME]: "" }),
    });

    expect(result.status).toEqual(403);
  });

  test("denied - invalid api key", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyAdapter.HEADER_NAME]: INVALID_API_KEY }),
    });

    expect(result.status).toEqual(403);
  });
});
