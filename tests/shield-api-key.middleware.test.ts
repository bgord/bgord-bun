import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldApiKey } from "../src/shield-api-key.middleware";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const apiKeyShield = new ShieldApiKey({ API_KEY: tools.ApiKey.parse(VALID_API_KEY) });

describe("ApiKeyShield middleware", () => {
  test("happy path", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKey.HEADER_NAME]: VALID_API_KEY }),
    });

    expect(result.status).toEqual(200);
  });

  test("denied - no api key", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKey.HEADER_NAME]: "" }),
    });

    expect(result.status).toEqual(403);
  });

  test("denied - invalid api key", async () => {
    const app = new Hono().use(apiKeyShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKey.HEADER_NAME]: INVALID_API_KEY }),
    });

    expect(result.status).toEqual(403);
  });
});
