import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { AccessDeniedApiKeyError, ShieldApiKeyStrategy } from "../src/shield-api-key.strategy";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const shield = new ShieldApiKeyStrategy({ API_KEY: tools.ApiKey.parse(VALID_API_KEY) });

const app = new Hono()
  .use(shield.verify)
  .get("/ping", (c) => c.text("OK"))
  // @ts-expect-error
  .onError((error, c) => {
    if (error.message === AccessDeniedApiKeyError.message) {
      return c.json(
        { message: AccessDeniedApiKeyError.message, _known: true },
        AccessDeniedApiKeyError.status,
      );
    }
    return c.status(500);
  });
describe("ShieldApiKeyStrategy", () => {
  test("happy path", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyStrategy.HEADER_NAME]: VALID_API_KEY }),
    });

    expect(result.status).toEqual(200);
  });

  test("denied - no api key", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyStrategy.HEADER_NAME]: "" }),
    });
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("access_denied_api_key");
  });

  test("denied - invalid api key", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyStrategy.HEADER_NAME]: INVALID_API_KEY }),
    });
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("access_denied_api_key");
  });
});
