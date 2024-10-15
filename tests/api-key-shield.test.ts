import { Hono } from "hono";
import { describe, test, expect } from "bun:test";

import { ApiKeyShield } from "../src/api-key-shield";

const VALID_API_KEY = "valid-api-key";
const INVALID_API_KEY = "invalid-api-key";

const apiKeyShield = new ApiKeyShield({ API_KEY: VALID_API_KEY });

describe("ApiKeyShield middleware", () => {
  test("allows access with valid API key", async () => {
    const app = new Hono();
    app.use(apiKeyShield.verify);
    app.get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ApiKeyShield.HEADER_NAME]: VALID_API_KEY }),
    });

    expect(result.status).toEqual(200);
  });

  test("denies access with missing API key", async () => {
    const app = new Hono();
    app.use(apiKeyShield.verify);
    app.get("/ping", () => {
      expect.unreachable();
    });

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ApiKeyShield.HEADER_NAME]: "" }),
    });

    expect(result.status).toEqual(403);
  });

  test("denies access with invalid API key", async () => {
    const app = new Hono();
    app.use(apiKeyShield.verify);
    app.get("/ping", () => {
      expect.unreachable();
    });

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ApiKeyShield.HEADER_NAME]: INVALID_API_KEY }),
    });

    expect(result.status).toEqual(403);
  });
});
