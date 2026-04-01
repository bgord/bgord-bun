import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { ShieldApiKeyStrategy, ShieldApiKeyStrategyError } from "../src/shield-api-key.strategy";
import { ShieldApiKeyHonoStrategy } from "../src/shield-api-key-hono.strategy";

const VALID_API_KEY = "x".repeat(64);
const INVALID_API_KEY = "invalid-api-key";

const shield = new ShieldApiKeyHonoStrategy({ API_KEY: v.parse(tools.ApiKey, VALID_API_KEY) });

const app = new Hono()
  .use(shield.handle())
  .get("/ping", (c) => c.text("OK"))
  .onError((error, c) => {
    if (error.message === ShieldApiKeyStrategyError.Rejected) {
      return c.json({ message: ShieldApiKeyStrategyError.Rejected, _known: true }, 403);
    }
    return c.json({}, 500);
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
    expect(json.message).toEqual("shield.api.key.rejected");
  });

  test("denied - invalid api key", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [ShieldApiKeyStrategy.HEADER_NAME]: INVALID_API_KEY }),
    });
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.api.key.rejected");
  });
});
